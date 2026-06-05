// =====================================================================
    // VOICE CONTROL — ZoonoAb Presentation Mode  v2
    // STT:  Web Speech API  (free, Chrome/Edge built-in)
    // NLU:  Gemini 1.5 Flash via /api/voice-intent  (free tier, backend)
    // TTS:  Web Speech Synthesis API  (free, all browsers)
    // Fallback: keyword matching when API unavailable
    // =====================================================================

    const VOICE_COMMANDS = [];

    let _voiceRecog        = null;
    let _voiceActive       = false;
    let _voiceMuted        = false;
    let _voiceFeedbackTimer = null;
    let _voiceHistory      = [];      // last 5 spoken commands for context
    let _voiceProcessing   = false;   // command queue lock
    let _voiceQueue        = [];      // queued commands while processing
    let _voiceRestartCount = 0;       // health monitor restart counter
    let _voiceRestartTimer = null;
    let _voiceAudioCtx     = null;    // Web Audio for level meter
    let _voiceAnalyser     = null;
    let _voiceLevelRaf     = null;    // requestAnimationFrame id for meter
    let _voiceApiOk        = null;    // null=unchecked, true=ok, false=offline
    let _voicePausedForTTS = false;   // mic paused while AI is speaking (prevent echo loop)
    let _asrDashscope      = false;   // true = using DashScope Paraformer instead of Web Speech
    let _asrAudioCtx       = null;    // AudioContext at 16kHz for PCM capture
    let _asrProcessor      = null;    // ScriptProcessorNode
    let _asrMicStream      = null;    // MediaStream for ASR capture
    let _asrInterimText    = '';      // current interim transcript from Paraformer
    let _asrSpeechStarted  = false;
    let _asrLastSpeechAt   = 0;
    let _asrSegmentStartedAt = 0;
    let _asrListenStartedAt = 0;
    let _asrPeakRms        = 0;
    let _asrFinishPending  = false;
    let _asrPreRoll        = [];
    let _wakeEnabled       = false;   // hands-free wake-word listening (opt-in)
    let _wakeRecog         = null;    // separate background recognizer for the wake phrase
    let _wakeRestartTimer  = null;
    let _audioUnlocked     = false;   // HTMLMediaElement autoplay unlocked via a user gesture
    let _voiceMeterStream  = null;    // meter mic stream for live level + barge-in

    // Unlock <audio> autoplay during a real click — so wake-word (gesture-less) activation can
    // still play CosyVoice TTS instead of falling back to the robotic browser voice.
    function _unlockAudio() {
        if (_audioUnlocked) return;
        _audioUnlocked = true;
        try {
            const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
            a.volume = 0;
            const p = a.play();
            if (p && p.catch) p.catch(() => {});
        } catch(e) {}
    }
    let _bargeFrames       = 0;       // sustained-speech counter for meter barge-in
    let _asrBargeFrames    = 0;       // sustained-speech counter for local-ASR barge-in
    // Barge-in is required for现场语音：用户开口应立即打断小诺播报并进入聆听。
    const _VAD_BARGE_ENABLED = true;
    const _ASR_START_RMS      = 0.014;
    const _ASR_CONTINUE_RMS   = 0.008;
    const _ASR_BARGE_RMS      = 0.017;
    const _ASR_BARGE_FRAMES   = 4;
    const _ASR_SILENCE_MS     = 940;
    const _ASR_MAX_SEGMENT_MS = 8000;
    const _ASR_IDLE_HINT_MS   = 12000;
    const _ASR_MIN_SEGMENT_MS = 300;
    const _ASR_PREROLL_CHUNKS = 6;
    const _TTS_RESUME_DELAY_MS = 120;
    const _voiceStats      = { heard: 0, qaFast: 0, nlu: 0, commands: 0, errors: 0 };  // lightweight telemetry (window._voiceStats)
    if (typeof window !== 'undefined') window._voiceStats = _voiceStats;

    // ── Stop whatever the assistant is currently saying (serialize all TTS) ──
    // Prevents two overlapping voices: every new utterance must silence the prior one,
    // including any orphaned <audio> and queued/browser speech.
    // Hard-kill an <audio>: detach handlers, pause, clear src — so it can NEVER play later (no orphans)
    function _killAudio(el) {
        if (!el) return;
        try { el.onended = null; el.onerror = null; el.onplaying = null; el.oncanplay = null; el.pause(); el.removeAttribute('src'); el.src = ''; el.load && el.load(); } catch(e) {}
    }

    function _stopCurrentTTS() {
        _ttsQueue = [];
        _killAudio(_ttsCurrentAudio);
        _ttsCurrentAudio = null;
        if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch(e){} }
        if (_ttsResolveCurrent) { const r = _ttsResolveCurrent; _ttsResolveCurrent = null; r(); }
    }

    // ── TTS: AI speaks back — streaming CosyVoice → browser TTS (fallback) ──
    function speakVoice(text) {
        if (_voiceMuted || !text) return;

        _stopCurrentTTS();               // never layer on top of an in-flight utterance
        _voicePausedForTTS = true;
        if (_voiceRecog) { try { _voiceRecog.abort(); } catch(e) {} }

        const resumeMic = () => {
            // Short settle delay keeps reactions fast while still avoiding obvious speaker tail.
            setTimeout(() => {
                _voicePausedForTTS = false;
                if (_voiceActive && !_asrDashscope && _voiceRecog) { try { _voiceRecog.start(); } catch(e) {} }
            }, _TTS_RESUME_DELAY_MS);
        };

        // Machine-voice fallback REMOVED — if CosyVoice can't play we stay silent (text is on screen).
        const _noSpeechFallback = () => { _killAudio(_ttsCurrentAudio); _ttsCurrentAudio = null; resumeMic(); };

        // CosyVoice only (no browser speechSynthesis — never the robotic machine voice)
        try {
            const audio = new Audio('/api/tts-stream?text=' + encodeURIComponent(text.slice(0, 500)));
            _ttsCurrentAudio = audio;
            audio.onended = () => { if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; resumeMic(); };
            audio.onerror = () => { _killAudio(audio); if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; resumeMic(); };
            audio.play().catch(() => { _killAudio(audio); if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; resumeMic(); });
        } catch(e) { _noSpeechFallback(); }
    }

    // ── Streamed TTS: speak a long answer sentence-by-sentence (fast first audio) ──
    let _ttsQueue          = [];
    let _ttsCurrentAudio   = null;
    let _ttsResolveCurrent = null;  // resolves the in-flight chunk promise (for barge-in)

    function _ttsFetchBlob(chunk) {
        return fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: chunk }),
            signal: AbortSignal.timeout(8000),
        }).then(r => r.ok ? r.blob() : null).catch(() => null);
    }

    function _ttsPlayBlob(blob, chunk) {
        return new Promise(resolve => {
            const finish = () => { _ttsResolveCurrent = null; resolve(); };
            _ttsResolveCurrent = finish;  // allow barge-in to resolve early
            // No machine-voice fallback — skip silently if the chunk failed (CosyVoice only)
            if (!blob || blob.size < 800) { finish(); return; }
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            _ttsCurrentAudio = audio;
            audio.onended = () => { URL.revokeObjectURL(url); if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; finish(); };
            audio.onerror = () => { _killAudio(audio); URL.revokeObjectURL(url); if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; finish(); };
            audio.play().catch(() => { _killAudio(audio); URL.revokeObjectURL(url); if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; finish(); });
        });
    }

    // Progressive streaming TTS: one <audio> against /api/tts-stream → fast first audio, gapless.
    // Resolves true if it played (or was interrupted), false if it never started (→ caller falls back).
    function _ttsStreamPlay(text) {
        return new Promise(resolve => {
            let resolved = false, playing = false;
            const finish = (v) => { if (!resolved) { resolved = true; _ttsResolveCurrent = null; resolve(v); } };
            try {
                const audio = new Audio('/api/tts-stream?text=' + encodeURIComponent(text.slice(0, 800)));
                _ttsCurrentAudio = audio;
                audio.onplaying = () => { playing = true; };
                audio.onended  = () => { if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; finish(true); };
                audio.onerror  = () => { _killAudio(audio); if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; finish(playing); };  // started→true (no re-speak), else false→fallback
                _ttsResolveCurrent = () => { _killAudio(audio); finish(true); };  // barge-in hook
                audio.play().catch(() => { _killAudio(audio); if (_ttsCurrentAudio === audio) _ttsCurrentAudio = null; finish(playing); });
            } catch(e) { finish(false); }
        });
    }

    async function speakVoiceStreaming(text) {
        if (_voiceMuted || !text) return;

        // Stop any prior utterance (greeting / "正在分析" ack / earlier answer) — no overlap
        _stopCurrentTTS();

        // Pause mic for the whole answer (echo prevention)
        _voicePausedForTTS = true;
        if (_voiceRecog) { try { _voiceRecog.abort(); } catch(e) {} }

        // Show barge-in hint while speaking
        const barge = document.getElementById('voiceSiriBarge');
        if (barge) barge.style.display = 'block';

        // 1) Progressive streaming TTS (one request — fast first audio, no inter-sentence gaps)
        const streamed = await _ttsStreamPlay(text);

        // 2) Fallback: sentence-chunked blob TTS (proven path) only if streaming never started
        if (!streamed && _voiceActive && !_voiceMuted) {
            const parts = text.split(/(?<=[。！？!?；;])/).map(s => s.trim()).filter(Boolean);
            _ttsQueue = parts.length ? parts : [text];
            let prefetch = _ttsFetchBlob(_ttsQueue[0]);
            for (let i = 0; i < _ttsQueue.length; i++) {
                if (!_voiceActive || _voiceMuted || _ttsQueue.length === 0) break;
                const blob = await prefetch;
                if (_ttsQueue.length === 0) break;
                prefetch = (i + 1 < _ttsQueue.length) ? _ttsFetchBlob(_ttsQueue[i + 1]) : Promise.resolve(null);
                await _ttsPlayBlob(blob, _ttsQueue[i]);
            }
            _ttsQueue = [];
        }
        if (barge) barge.style.display = 'none';

        // Resume mic — unless a newer utterance has already taken over (avoids resume-mid-speech race).
        // Short settle delay so the next command is picked up quickly after TTS ends.
        if (!_ttsCurrentAudio) {
            setTimeout(() => {
                if (_ttsCurrentAudio) return;            // a newer utterance started — let it own the mic
                _voicePausedForTTS = false;
                if (_voiceActive && !_asrDashscope && _voiceRecog) { try { _voiceRecog.start(); } catch(e) {} }
            }, _TTS_RESUME_DELAY_MS);
        }
    }

    // ── Open panel/tab then run the analysis function ──
    // fn1 = right-panel version, fn2 = seq-panel version
    // Picks fn2 when seq panel is active (different DOM elements), fn1 otherwise.
    function _voiceRunAnalysis(openFn, fn1, fn2) {
        try { openFn(); } catch(e) {}
        showToast('语音已打开对应分析面板；运行分析请手动确认。', 'info');
    }

    // ── Natural-language heuristics: route obvious questions straight to the agent ──
    function _looksLikeCommand(t) {
        const s = (t || '').trim();
        return /^(运行|执行|跑|计算|打开|关闭|收起|切换|新建|创建|上传|放大|缩小|拉近|拉远|旋转|停止|停转|高亮|聚焦|全屏|重置|复位|静音|退出)/.test(s)
            || /设计\s*\d*\s*个/.test(s);
    }
    function _looksLikeQuestion(t) {
        const s = (t || '').trim();
        if (s.length < 5) return false;
        return /(什么|怎么|为什么|为何|如何|区别|差异|哪些|哪个|是不是|能不能|可不可以|有没有|意思|原理|作用|怎样|吗|呢|\?|？)/.test(s);
    }

    function _voiceCommonAnswer(text) {
        if (typeof window.voiceCommonAnswer === 'function') return window.voiceCommonAnswer(text);
        const s = String(text || '').replace(/\s+/g, '');
        if (/你好|在吗|嗨/.test(s)) return '我在。你可以让我打开快速设计、打开序列分析，或者询问网站功能。';
        if (/能做什么|网站功能|平台功能/.test(s)) return '这个网站可以做快速分子设计、序列分析、结构分析、知识库资料管理和 3D 结果展示。';
        if (/快速设计/.test(s)) return '快速设计会按向导选择疾病方向、靶标蛋白、作用机制和表位策略，最后确认启动 AI 分子设计。';
        if (/序列分析|打开序列/.test(s)) return '序列分析可以做 CDR 注释、风险位点扫描、人源化、多序列比对和理化性质分析。';
        if (/结构分析|三维|3d/i.test(s)) return '结构分析可以查看 3D 分子结构，并支持表位预测、结构预测和相互作用分析。';
        return '';
    }

    // ── Persona: varied acknowledgments & greetings (小诺) ──
    const _VOICE_ACKS      = ['好的，正在分析', '收到，我看看', '稍等，马上为你查', '好嘞，正在处理', '明白，分析中'];
    const _VOICE_GREETINGS = ['我在。可以说“打开快速设计”', '我在听，可以控制网站功能', '请说“打开快速设计”或“打开序列分析”'];
    const _voiceAck      = () => _VOICE_ACKS[Math.floor(Math.random() * _VOICE_ACKS.length)];
    const _voiceGreeting = () => _VOICE_GREETINGS[Math.floor(Math.random() * _VOICE_GREETINGS.length)];

    // ── Voice Q&A → real chat agent (rich answer + streamed spoken reply) ──
    let _voiceAgentTimer = null;
    function _voiceAskAgent(question) {
        const msg = _voiceCommonAnswer(question) || '我可以控制网站已有功能。请说“打开快速设计”，或问我平台能做什么。';
        updateVoiceBar({ heard: question, response: msg });
        _voicePushTranscript('ai', msg);
        speakVoice(msg);
        clearTimeout(_voiceAgentTimer);
        _voiceAgentTimer = setTimeout(() => { if (_voiceActive) _voiceSetState('listening'); }, 2200);
    }

    // ── Context-aware tab opener ──
    // If the matching panel is already open, switches its tab.
    // Otherwise closes any conflicting left panel and opens the right panel.
    function _voiceOpenTab(rightTab, seqTab, structTab) {
        if (activeAnalysisPanel === 'seq' && seqTab) {
            switchApt('seq', seqTab);
        } else if (activeAnalysisPanel === 'struct' && structTab) {
            switchApt('struct', structTab);
        } else {
            if (activeAnalysisPanel) closeAnalysisPanel(activeAnalysisPanel);
            if (rightTab) openRightPanel(rightTab);
        }
    }

    // ── Action dispatcher: action name → JS function ──
    // All function names verified against actual codebase definitions.
    const VOICE_ACTION_MAP = {
        start_design: () => {
            if (typeof window.handleQuickDesignVoiceCommand === 'function') {
                window.handleQuickDesignVoiceCommand('小诺，打开快速设计', { requireWakeToOpen: true, source: 'wake' });
            }
        },
        new_design: () => {
            if (typeof window.handleQuickDesignVoiceCommand === 'function') {
                window.handleQuickDesignVoiceCommand('小诺，打开快速设计', { requireWakeToOpen: true, source: 'wake' });
            }
        },
        voice_help: () => showVoiceHelp(),
        stop_voice: () => stopVoiceControl(),
        qa_answer: () => _voiceAskAgent('')
    };

    function _getCurrentContext() {
        let base = 'AI抗体设计对话';
        if (document.getElementById('batchesSection')?.style.display !== 'none') base = '实验批次列表';
        else if (document.getElementById('teamSection')?.style.display !== 'none') base = '团队协作';
        else if (document.getElementById('kbSection')?.style.display !== 'none') base = '知识库';
        else if (activeAnalysisPanel === 'seq') {
            const activeTab = document.querySelector('#seq-panel .apt-btn.active')?.textContent?.trim() || '';
            base = `序列分析面板 > ${activeTab || '概览'}`;
        } else if (activeAnalysisPanel === 'struct') {
            const activeTab = document.querySelector('#struct-panel .apt-btn.active')?.textContent?.trim() || '';
            base = `结构分析面板 > ${activeTab || '概览'}`;
        }
        const rightTab = document.getElementById('rightPanel')?.style.display !== 'none'
            ? (document.querySelector('.right-panel-tab.active')?.textContent?.trim() || '') : '';
        if (rightTab) base += ` + 右侧${rightTab}`;
        return base;
    }

    function _getCurrentSeqContext() {
        const inputs = ['cdrSeqInput','riskSeqInput','matSeqInput','humSeqInput','physSeqInput','msaInput','seqBLASTInput'];
        for (const id of inputs) {
            const v = document.getElementById(id)?.value?.trim();
            if (v && v.length > 8) return v.slice(0, 40) + (v.length > 40 ? '…' : '');
        }
        return null;
    }

    function _getLastResultContext() {
        if (!window._voiceLastResult) return null;
        return window._voiceLastResult;
    }

    // ── Biotech ASR correction: maps common misrecognitions → correct terms ──
    const _BIOTECH_CORRECTIONS = {
        // 人源化
        '人员画':'人源化','人员化':'人源化','仁源化':'人源化','人元化':'人源化',
        '人源画':'人源化','人源话':'人源化','仁源画':'人源化','仁源话':'人源化',
        '人圆化':'人源化','人苑化':'人源化','人猿化':'人源化',
        // 纳米抗体
        '那米抗体':'纳米抗体','纳摩抗体':'纳米抗体','那摩抗体':'纳米抗体','那么抗体':'纳米抗体',
        '纳米体':'纳米抗体','那米体':'纳米抗体','单体抗体':'纳米抗体','单域抗体':'纳米抗体',
        // 表位
        '表卫预测':'表位预测','表维预测':'表位预测','标位预测':'表位预测','彪位预测':'表位预测',
        '表卫':'表位','表维':'表位','标位':'表位','彪位':'表位',
        // 亲和力成熟
        '亲和力城市':'亲和力成熟','亲和力乘数':'亲和力成熟','亲和力程序':'亲和力成熟',
        '亲和力成数':'亲和力成熟','亲和力呈现':'亲和力成熟','亲和力城熟':'亲和力成熟',
        '亲和城市':'亲和力成熟','亲和成熟':'亲和力成熟',
        // CDR
        'CDR三':'CDR-H3','cdr三':'CDR-H3','CDR H3':'CDR-H3','CDRH3':'CDR-H3',
        'CDR H1':'CDR-H1','CDRH1':'CDR-H1','CDR H2':'CDR-H2','CDRH2':'CDR-H2',
        'CDR L1':'CDR-L1','CDRL1':'CDR-L1','CDR L2':'CDR-L2','CDRL2':'CDR-L2',
        'CDR L3':'CDR-L3','CDRL3':'CDR-L3',
        '互补决定区':'CDR','互补决定':'CDR',
        // 多序列比对
        '多序列对比':'多序列比对','多序列对齐':'多序列比对','多序列匹配':'多序列比对',
        // 理化性质
        '理化性':'理化性质','物化性':'物化性质','理化性制':'理化性质','物化性制':'物化性质',
        // VHH
        'V H H':'VHH','VH H':'VHH','V-H-H':'VHH','vhh':'VHH',
        '威哈哈':'VHH','威H H':'VHH','维H H':'VHH','W H H':'VHH',
        // IL系列
        'IL33':'IL-33','IL 33':'IL-33','IL三三':'IL-33','艾尔33':'IL-33',
        '艾尔三三':'IL-33','il33':'IL-33','il-33':'IL-33','爱有33':'IL-33',
        'IL6':'IL-6','IL 6':'IL-6','IL六':'IL-6','il6':'IL-6',
        'IL8':'IL-8','IL 8':'IL-8','IL八':'IL-8','il8':'IL-8',
        'IL17':'IL-17','IL 17':'IL-17','IL十七':'IL-17','il17':'IL-17',
        'IL23':'IL-23','IL 23':'IL-23','IL二三':'IL-23','il23':'IL-23',
        'IL4':'IL-4','IL 4':'IL-4','IL四':'IL-4','il4':'IL-4',
        'IL13':'IL-13','IL 13':'IL-13','il13':'IL-13',
        'IL31':'IL-31','IL 31':'IL-31','il31':'IL-31',
        // PD-1 / PD-L1
        'PD1':'PD-1','PD 1':'PD-1','PD一':'PD-1','皮迪一':'PD-1','pd1':'PD-1','pd-1':'PD-1',
        'PDL1':'PD-L1','PD L1':'PD-L1','PD-L一':'PD-L1','PDL一':'PD-L1',
        'pdl1':'PD-L1','PD-L 1':'PD-L1','PD L 1':'PD-L1',
        // VEGF
        'VEG F':'VEGF','V E G F':'VEGF','vegf':'VEGF','Vegf':'VEGF','V-E-G-F':'VEGF',
        '维基府':'VEGF','威基府':'VEGF',
        // HER2
        'HER 2':'HER2','her2':'HER2','Her2':'HER2','H E R 2':'HER2','HER-2':'HER2',
        // EGFR
        'E G F R':'EGFR','egfr':'EGFR','Egfr':'EGFR','E-G-F-R':'EGFR',
        // CTLA-4
        'CTLA4':'CTLA-4','ctla4':'CTLA-4','ctla-4':'CTLA-4','CTLA 4':'CTLA-4',
        // CD靶点
        'CD3 e':'CD3e','CD 3e':'CD3e','CD三e':'CD3e','CD3E':'CD3e','cd3e':'CD3e',
        'CD 19':'CD19','cd19':'CD19','CD 20':'CD20','cd20':'CD20',
        'CD 38':'CD38','cd38':'CD38','CD 28':'CD28','cd28':'CD28','CD 40':'CD40','cd40':'CD40',
        // Fab / scFv
        'FAB':'Fab','fab':'Fab','F A B':'Fab',
        'SC FV':'scFv','scFV':'scFv','ScFv':'scFv','SC Fv':'scFv','scfv':'scFv','SCFV':'scFv',
        // IgG
        'igg':'IgG','IGG':'IgG','I G G':'IgG',
        'IgG 1':'IgG1','igg1':'IgG1','IGG1':'IgG1','Ig G1':'IgG1',
        'IgG 4':'IgG4','igg4':'IgG4','IGG4':'IgG4',
        // TNF
        'TNF α':'TNF-α','TNFα':'TNF-α','TNF-A':'TNF-α','tnf':'TNF',
        // LAG-3 / TIM-3
        'LAG3':'LAG-3','LAG 3':'LAG-3','lag3':'LAG-3',
        'TIM3':'TIM-3','TIM 3':'TIM-3','tim3':'TIM-3',
        // PCSK9
        'pcsk9':'PCSK9','PCSK 9':'PCSK9','P C S K 9':'PCSK9',
        // ACE2
        'ace2':'ACE2','ACE 2':'ACE2',
        // 双特异性
        '双特性抗体':'双特异性抗体','双特一性抗体':'双特异性抗体','双特异抗体':'双特异性抗体',
        // 阻断 / 靶向 / 候选 常见误识别
        '组断':'阻断','租断':'阻断','阻段':'阻断',
        '巴向':'靶向','把向':'靶向','靶项':'靶向',
        '候先':'候选','后选':'候选','后先':'候选',
        '从头设':'从头设计','重新设计':'从头设计',
        '抗I L':'抗IL','抗i l':'抗IL',
    };

    // Convert Chinese number words before 个 to Arabic digits (十五个→15个 etc.)
    function _normalizeNumbers(text) {
        const d = {'零':'0','一':'1','二':'2','两':'2','三':'3','四':'4','五':'5','六':'6','七':'7','八':'8','九':'9'};
        let t = text
            .replace(/([二三四五六七八九])十([一二三四五六七八九])(个)/g, (_,a,b,m) => (d[a]||a)+(d[b]||b)+m)
            .replace(/([二三四五六七八九])十(个)/g, (_,a,m) => (d[a]||a)+'0'+m)
            .replace(/十([一二三四五六七八九])(个)/g, (_,b,m) => '1'+(d[b]||b)+m)
            .replace(/十(个)/g, '10$1');
        t = t.replace(new RegExp('([' + Object.keys(d).join('') + '])(个)', 'g'), (_,a,m) => (d[a]||a)+m);
        return t;
    }

    function _applyBiotechCorrections(text) {
        let t = _normalizeNumbers(text);
        for (const [wrong, right] of Object.entries(_BIOTECH_CORRECTIONS)) {
            t = t.split(wrong).join(right);
        }
        return t;
    }

    async function processVoiceText(alts) {
        if (_voiceIsSpeaking && _voiceIsSpeaking()) {
            _voiceStopSpeaking({ bargeIn: true, source: 'asr-final' });
        }
        // ── Command queue: if already processing, enqueue and return ──
        if (_voiceProcessing) { _voiceQueue.push(alts); return; }
        _voiceProcessing = true;

        // Apply biotech term corrections to all recognition alternatives
        const text = _applyBiotechCorrections(alts[0]);
        _voiceHistory.push(text);
        if (_voiceHistory.length > 5) _voiceHistory.shift();
        _voicePushTranscript('user', text);
        updateVoiceBar({ heard: text, response: '匹配快速设计指令…', thinking: true });
        _voiceStats.heard++;

        if (typeof window.handleQuickDesignVoiceCommand === 'function') {
            const quickDesignOpen = typeof window.isQuickDesignOpen === 'function' && window.isQuickDesignOpen();
            const hasWake = /小\s*诺|晓\s*诺|小糯|小喏|你好\s*小/.test(text);
            const qdResult = window.handleQuickDesignVoiceCommand(text, {
                speak: false,
                requireWakeToOpen: !quickDesignOpen,
                source: quickDesignOpen ? 'quick-design' : (hasWake ? 'wake' : '')
            });
            if (qdResult && qdResult.handled) {
                const reply = qdResult.label || '已处理快速设计指令';
                _voiceStats.commands++;
                updateVoiceBar({ heard: text, response: reply });
                _voicePushTranscript('ai', reply);
                speakVoice(reply);
                _voiceProcessing = false;
                _voiceDrainQueue();
                return;
            }
        }

        const localAnswer = _voiceCommonAnswer(text);
        const msg = localAnswer || '我可以控制网站已有功能。请说“打开快速设计”，或问我平台能做什么。';
        updateVoiceBar({ heard: text, response: msg });
        _voicePushTranscript('ai', msg);
        if (localAnswer) speakVoice(localAnswer);
        _voiceStats.errors++;
        _voiceProcessing = false;
        _voiceDrainQueue();
    }

    function _voiceDrainQueue() {
        if (_voiceQueue.length > 0) {
            const next = _voiceQueue.shift();
            setTimeout(() => processVoiceText(next), 60);
        }
    }

    // ── Low-confidence confirmation dialog ──
    function _voiceShowConfirm(heard, intent) {
        const card = document.getElementById('voiceSiriCard');
        const textEl = document.getElementById('voiceSiriText');
        const status = document.getElementById('voiceSiriStatus');
        if (!card) return;
        if (status) { status.textContent = '请确认'; status.style.color = '#D97706'; }
        _voiceOrbState('idle');
        if (textEl) {
            textEl.style.color = '#1f2937';
            textEl.style.fontStyle = 'normal';
            textEl.innerHTML = `你是说 <b style="color:#2563EB">"${intent.reply || intent.action}"</b> 吗？<br>
                <div style="display:flex;gap:8px;justify-content:center;margin-top:10px;">
                    <button onclick="window._voiceConfirmYes()" style="padding:6px 18px;background:linear-gradient(135deg,#2563EB,#7C3AED);border:none;border-radius:8px;color:white;cursor:pointer;font-size:13px;">是的</button>
                    <button onclick="window._voiceConfirmNo()" style="padding:6px 18px;background:rgba(15,23,42,0.06);border:1px solid rgba(15,23,42,0.1);border-radius:8px;color:#475569;cursor:pointer;font-size:13px;">不是</button>
                </div>`;
        }
        speakVoice(`你是说${intent.reply || intent.action}吗`);
        window._voiceConfirmYes = () => {
            textEl.innerHTML = '';
            updateVoiceBar({ heard, response: intent.spoken || '好的，执行中' });
            speakVoice(intent.spoken || '好的');
            setTimeout(() => { try { VOICE_ACTION_MAP[intent.action](intent.params); } catch(e){} }, 100);
        };
        window._voiceConfirmNo = () => {
            _voiceSetState('listening');
            speakVoice('好的，请重新说');
        };
    }

    // ── Execution verification: check DOM state to confirm action worked ──
    function _anyPanelOpen() {
        const rp = document.getElementById('rightPanel');
        return !!activeAnalysisPanel || (rp && rp.style.display !== 'none');
    }
    function _voiceVerifyExecution(action) {
        const opens = ['open_cdr','open_risk','open_humanization','open_phys','open_msa','open_interaction','open_maturation','open_epitope','open_structpred','open_3d_editor'];
        const checks = {
            open_seq_panel:    () => activeAnalysisPanel === 'seq',
            open_struct_panel: () => activeAnalysisPanel === 'struct',
            nav_batches:  () => document.getElementById('batchesSection')?.style.display !== 'none',
            nav_team:     () => document.getElementById('teamSection')?.style.display !== 'none',
            nav_kb:       () => document.getElementById('kbSection')?.style.display !== 'none',
            nav_design:   () => { const b=document.getElementById('batchesSection'),t=document.getElementById('teamSection'),k=document.getElementById('kbSection'); return b?.style.display==='none' && t?.style.display==='none' && k?.style.display==='none'; },
            close_panels: () => !activeAnalysisPanel,
        };
        let check = checks[action];
        if (!check && opens.includes(action)) check = _anyPanelOpen;
        if (check && !check()) {
            _voiceSetState('response', '⚠️ 操作可能未成功，请手动检查');
        }
    }

    // ── Browser compatibility warning ──
    function _voiceCheckBrowser() {
        // The primary ASR path (DashScope over WebSocket + getUserMedia) works in all modern
        // browsers; only the offline Web Speech fallback is Chrome-only. So we do NOT show a
        // scary "Chrome only" banner — voice degrades gracefully on its own.
        // (kept as a no-op hook for future browser-specific notices)
    }

    // ── API preflight: test connection on voice start ──
    async function _voicePreflightCheck() {
        const dot  = document.getElementById('voiceSiriDot');
        const status = document.getElementById('voiceSiriStatus');
        try {
            const r = await fetch('/api/voice-intent', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({text:'测试连接', context:'启动'}),
                signal: AbortSignal.timeout(5000),
            });
            const d = await r.json();
            _voiceApiOk = d.action !== undefined;
        } catch(e) {
            _voiceApiOk = false;
        }
        if (!_voiceApiOk) {
            if (status) status.textContent = '离线模式';
            if (dot)    { dot.style.background = '#F59E0B'; dot.style.boxShadow = '0 0 8px #F59E0B'; }
            showToast('语音AI无法连接，将使用离线关键词模式', 'warning');
        }
    }

    // ── Real-time audio level meter: wave bars respond to actual voice + VAD barge-in ──
    async function _voiceStartAudioMeter() {
        try {
            // Echo cancellation lets us listen for the user *while the AI is speaking* (barge-in)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                video: false,
            });
            _voiceAudioCtx  = new (window.AudioContext || window.webkitAudioContext)();
            _voiceAnalyser  = _voiceAudioCtx.createAnalyser();
            _voiceAnalyser.fftSize = 128;
            _voiceAudioCtx.createMediaStreamSource(stream).connect(_voiceAnalyser);
            const data = new Uint8Array(_voiceAnalyser.frequencyBinCount);
            const barIdxs = [2, 5, 8, 11, 14, 17, 20]; // freq bins for 7 bars
            _voiceMeterStream = stream;
            const BARGE_LEVEL = 86;   // avg byte level (0-255) to count as user speech
            const BARGE_FRAMES = 7;   // sustained frames (~115ms) before interrupting
            function tick() {
                if (!_voiceActive) return;
                _voiceAnalyser.getByteFrequencyData(data);
                // Drive the orb's reactive scale from real mic level while listening
                const orb = document.getElementById('voiceSiriOrb');
                if (orb && orb.classList.contains('listening')) {
                    let sum = 0; for (const idx of barIdxs) sum += (data[idx] || 0);
                    const lvl = Math.min(1, (sum / barIdxs.length / 255) * 1.7);
                    orb.style.setProperty('--lvl', lvl.toFixed(2));
                }
                // VAD barge-in: if the AI is speaking and the user starts talking, stop the AI
                if (_VAD_BARGE_ENABLED && _voicePausedForTTS && _voiceIsSpeaking && _voiceIsSpeaking()) {
                    let sum = 0; for (const idx of barIdxs) sum += (data[idx] || 0);
                    const avg = sum / barIdxs.length;
                    if (avg > BARGE_LEVEL) {
                        _bargeFrames++;
                        if (_bargeFrames >= BARGE_FRAMES) {
                            _bargeFrames = 0;
                            _voiceRequestBargeIn('meter');
                        }
                    } else {
                        _bargeFrames = Math.max(0, _bargeFrames - 2);
                    }
                } else {
                    _bargeFrames = 0;
                }
                _voiceLevelRaf = requestAnimationFrame(tick);
            }
            tick();
        } catch(e) { /* mic already granted via SR, this is just for visuals */ }
    }

    function _voiceStopAudioMeter() {
        if (_voiceLevelRaf) { cancelAnimationFrame(_voiceLevelRaf); _voiceLevelRaf = null; }
        if (_voiceAudioCtx) { try { _voiceAudioCtx.close(); } catch(e){} _voiceAudioCtx = null; }
        if (_voiceMeterStream) { _voiceMeterStream.getTracks().forEach(t => t.stop()); _voiceMeterStream = null; }
        _voiceAnalyser = null;
    }

    function updateVoiceBar({ heard, response, thinking = false }) {
        if (thinking) _voiceSetState('thinking', heard);
        else _voiceSetState('response', response);
    }

    function voiceToggleMute() {
        _voiceMuted = !_voiceMuted;
        if (_voiceMuted) _voiceStopSpeaking({ source: 'mute' });
        const muteBtn = document.getElementById('voiceSiriMute');
        if (muteBtn) muteBtn.textContent = _voiceMuted ? '🔇' : '🔊';
        showToast(_voiceMuted ? '语音已静音' : '语音已开启', 'info');
    }

    // Drive the lively orb + status text per state
    function _voiceOrbState(cls) {
        const orb = document.getElementById('voiceSiriOrb');
        const wrap = document.getElementById('voiceSiriOrbWrap');
        if (orb) orb.className = 'vorb ' + cls;
        if (wrap) wrap.classList.toggle('on', cls === 'listening');  // ripples only while listening
        if (orb && cls !== 'listening') orb.style.setProperty('--lvl', 0);
    }
    function _voiceSetState(state, text) {
        const card   = document.getElementById('voiceSiriCard');
        if (!card) return;
        const status  = document.getElementById('voiceSiriStatus');
        const dot     = document.getElementById('voiceSiriDot');
        const textEl  = document.getElementById('voiceSiriText');
        const muteBtn = document.getElementById('voiceSiriMute');
        if (muteBtn) muteBtn.textContent = _voiceMuted ? '🔇' : '🔊';

        if (state === 'show') {
            card.style.display = 'block';
            requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateX(-50%) translateY(0)'; });
            return;
        }
        if (state === 'hide') {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-50%) translateY(16px)';
            setTimeout(() => { card.style.display = 'none'; card.style.transform = 'translateX(-50%) translateY(0)'; }, 300);
            return;
        }
        if (state === 'listening') {
            if (status) { status.textContent = '正在聆听…'; status.style.color = '#334155'; }
            if (dot)    { dot.style.background = '#10B981'; dot.style.boxShadow = '0 0 9px #10B981'; }
            _voiceOrbState('listening');
            if (textEl) { textEl.style.color = '#94a3b8'; textEl.style.fontStyle = 'italic'; textEl.textContent = text || '请说话…'; }
        }
        if (state === 'interim') {
            if (status) { status.textContent = '正在聆听…'; status.style.color = '#334155'; }
            if (dot)    { dot.style.background = '#10B981'; dot.style.boxShadow = '0 0 9px #10B981'; }
            _voiceOrbState('listening');
            if (textEl) { textEl.style.color = '#1f2937'; textEl.style.fontStyle = 'normal'; textEl.textContent = `“${text}”`; }
        }
        if (state === 'thinking') {
            if (status) { status.textContent = '正在思考…'; status.style.color = '#D97706'; }
            if (dot)    { dot.style.background = '#F59E0B'; dot.style.boxShadow = '0 0 9px #F59E0B'; }
            _voiceOrbState('thinking');
            if (textEl) { textEl.style.color = '#475569'; textEl.style.fontStyle = 'normal'; textEl.textContent = text ? `“${text}”` : ''; }
        }
        if (state === 'response') {
            if (status) { status.textContent = '小诺'; status.style.color = '#2563EB'; }
            if (dot)    { dot.style.background = '#10B981'; dot.style.boxShadow = '0 0 10px #10B981'; }
            _voiceOrbState(_voiceIsSpeaking && _voiceIsSpeaking() ? 'speaking' : 'idle');
            if (textEl) { textEl.style.color = '#1f2937'; textEl.style.fontStyle = 'normal'; textEl.textContent = text || ''; }
            clearTimeout(_voiceFeedbackTimer);
            _voiceFeedbackTimer = setTimeout(() => { if (_voiceActive) _voiceSetState('listening'); }, 4500);
        }
    }

    // Show proactive suggestion chips in voice card (Siri-like next-action hints)
    const _NEXT_SUGGESTIONS = {
        start_design: [
            { label:'开始设计', cmd:'开始设计' },
            { label:'选择 PD-L1', cmd:'PD-L1' }
        ],
    };

    // Starter prompts shown right when voice opens — so clients know what they can say
    function _voiceShowStarters() {
        const el = document.getElementById('voiceSiriSuggest');
        if (!el) return;
        const starters = ['打开快速设计', '开始设计', '肿瘤', 'PD-L1'];
        el.style.display = 'block';
        el.innerHTML = `<span style="font-size:10px;color:#64748b;display:block;margin-bottom:6px;">🎙️ 试试说（也可点击）：</span>` +
            starters.map(s => `<button onclick="processVoiceText(['${s}'])" style="margin:3px 3px;padding:5px 11px;background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.2);border-radius:14px;color:#2563EB;font-size:11px;font-weight:600;cursor:pointer;">${s}</button>`).join('');
    }

    function _voiceShowSuggestions(action) {
        const el = document.getElementById('voiceSiriSuggest');
        if (!el) return;
        const sugs = _NEXT_SUGGESTIONS[action];
        if (!sugs || !sugs.length) { el.style.display = 'none'; return; }
        el.style.display = 'block';
        el.innerHTML = `<span style="font-size:10px;color:#64748b;display:block;margin-bottom:5px;">试试说：</span>` +
            sugs.map(s => `<button onclick="processVoiceText(['${s.cmd}'])" style="margin:2px 3px;padding:4px 10px;background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.18);border-radius:14px;color:#2563EB;font-size:11px;font-weight:600;cursor:pointer;">"${s.label}"</button>`).join('');
        setTimeout(() => { if (el) el.style.display = 'none'; }, 8000);
    }

    // ── Conversation transcript: log each turn as a bubble in the voice card ──
    function _voicePushTranscript(role, text) {
        const log = document.getElementById('voiceSiriLog');
        if (!log || !text) return;
        log.style.display = 'flex';
        const isUser = role === 'user';
        const row = document.createElement('div');
        row.style.cssText = `display:flex;justify-content:${isUser ? 'flex-end' : 'flex-start'};`;
        const bubble = document.createElement('div');
        bubble.style.cssText = `max-width:82%;padding:6px 11px;border-radius:13px;font-size:12.5px;line-height:1.5;word-break:break-word;` +
            (isUser
                ? 'background:linear-gradient(135deg,#2563EB,#7C3AED);color:white;border-bottom-right-radius:4px;box-shadow:0 2px 8px rgba(37,99,235,0.25);'
                : 'background:rgba(15,23,42,0.05);color:#334155;border:1px solid rgba(15,23,42,0.06);border-bottom-left-radius:4px;');
        bubble.textContent = (isUser ? '' : '') + text;
        row.appendChild(bubble);
        log.appendChild(row);
        // keep last ~12 turns
        while (log.children.length > 12) log.removeChild(log.firstChild);
        log.scrollTop = log.scrollHeight;
    }

    // ── Barge-in: stop AI speech immediately and return to listening ──
    function _voiceIsSpeaking() {
        return (_ttsQueue && _ttsQueue.length > 0) || !!_ttsCurrentAudio ||
               (window.speechSynthesis && window.speechSynthesis.speaking);
    }

    function _voiceRequestBargeIn(source = 'vad') {
        if (!_VAD_BARGE_ENABLED || !_voicePausedForTTS || !_voiceIsSpeaking()) return false;
        _voiceStopSpeaking({ bargeIn: true, source });
        return true;
    }

    function _voiceStopSpeaking(opts = {}) {
        _stopCurrentTTS();
        _bargeFrames = 0;
        _asrBargeFrames = 0;
        const barge = document.getElementById('voiceSiriBarge');
        if (barge) barge.style.display = 'none';
        _voicePausedForTTS = false;
        if (_voiceActive && !_asrDashscope && _voiceRecog) {
            try { _voiceRecog.start(); } catch(e) {}
        }
        if (_voiceActive && _asrDashscope && !_asrProcessor && !_asrFinishPending && ws && ws.readyState === 1) {
            _asrRestartSession();
        }
        if (_voiceActive) _voiceSetState('listening', opts.bargeIn ? '我在听，请继续说...' : undefined);
    }

    // Click on the wave/text area: interrupt if speaking, otherwise no-op
    function _voiceWaveClick() {
        if (_voiceIsSpeaking()) _voiceStopSpeaking({ source: 'manual' });
    }

    // ── Visual linkage: briefly highlight the panel a voice command affected ──
    function _voiceFlash(el) {
        if (!el) return;
        el.classList.remove('voice-flash');
        // force reflow so the animation can replay
        void el.offsetWidth;
        el.classList.add('voice-flash');
        setTimeout(() => el.classList.remove('voice-flash'), 1400);
    }

    function _voiceFlashActive() {
        let el = null;
        if (activeAnalysisPanel === 'seq')    el = document.getElementById('seq-panel');
        else if (activeAnalysisPanel === 'struct') el = document.getElementById('struct-panel');
        if (!el) {
            const rp = document.getElementById('rightPanel');
            if (rp && rp.style.display !== 'none') el = rp;
        }
        _voiceFlash(el);
    }

    function initVoiceControlUI() {
        console.log('%c[ZoonoAb] 语音构建 voice-fix-v8 · 浅色磨砂 + 灵动语音球 · ' + new Date().toISOString().slice(0,16), 'color:#2563EB;font-weight:700');
        if (document.getElementById('voiceCtrlBtn') || document.getElementById('voiceBtn')) return;

        // Floating mic button (bottom-right, gradient like 小爱同学)
        const btn = document.createElement('button');
        btn.id = 'voiceCtrlBtn';
        btn.title = '语音助手';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`;
        Object.assign(btn.style, {
            position:'fixed', bottom:'24px', right:'24px', zIndex:'9998',
            width:'52px', height:'52px', borderRadius:'50%',
            background:'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            color:'white', border:'none',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 20px rgba(99,102,241,0.5)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        });
        btn.setAttribute('onclick', 'toggleVoiceControl()');
        btn.querySelector('svg')?.style.setProperty('pointer-events', 'none');
        document.body.appendChild(btn);

        // Hands-free wake-word toggle (small pill above the mic button)
        const wake = document.createElement('button');
        wake.id = 'voiceWakeToggle';
        Object.assign(wake.style, {
            position:'fixed', bottom:'84px', right:'24px', zIndex:'9998',
            padding:'5px 11px', borderRadius:'14px', border:'none',
            background:'rgba(30,41,59,0.85)', color:'rgba(255,255,255,0.7)',
            fontSize:'11px', fontWeight:'600', cursor:'pointer',
            boxShadow:'0 2px 10px rgba(0,0,0,0.25)', backdropFilter:'blur(8px)',
            transition:'all 0.2s ease', whiteSpace:'nowrap',
        });
        wake.innerHTML = '💤 免提';
        wake.setAttribute('onclick', 'toggleWakeWord()');
        document.body.appendChild(wake);

        // Restore hands-free preference
        try { _wakeEnabled = localStorage.getItem('zoo_wake') === '1'; } catch(e) {}
        _updateWakeBtn();
        if (_wakeEnabled) setTimeout(_startWakeWord, 1500);

        // Siri-style card (bottom-center, slides up)
        const card = document.createElement('div');
        card.id = 'voiceSiriCard';
        card.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:8px;padding:5px 12px 5px 9px;border-radius:999px;background:rgba(37,99,235,0.07);border:1px solid rgba(37,99,235,0.14);">
                    <div id="voiceSiriDot" style="width:8px;height:8px;border-radius:50%;background:#10B981;box-shadow:0 0 9px #10B981;animation:vsBlink 1.6s ease-in-out infinite;flex-shrink:0;"></div>
                    <span id="voiceSiriStatus" style="font-size:12.5px;font-weight:700;letter-spacing:0.3px;color:#334155;">正在聆听…</span>
                </div>
                <div style="display:flex;gap:7px;">
                    <button id="voiceSiriMute" onclick="voiceToggleMute()" class="vbtn" title="静音/取消静音">🔊</button>
                    <button onclick="stopVoiceControl()" class="vbtn vbtn-close" title="关闭语音助手">✕</button>
                </div>
            </div>
            <div id="voiceSiriLog" style="display:none;flex-direction:column;gap:7px;max-height:148px;overflow-y:auto;margin-bottom:10px;padding:4px 2px;"></div>
            <div id="voiceSiriOrbWrap" onclick="_voiceWaveClick()" title="点击可打断" style="position:relative;display:flex;align-items:center;justify-content:center;height:128px;margin:2px 0 10px;cursor:pointer;">
                <span class="vorb-ripple"></span><span class="vorb-ripple vorb-ripple2"></span><span class="vorb-ripple vorb-ripple3"></span>
                <div id="voiceSiriOrb" class="vorb idle">
                    <span class="vorb-sheen"></span>
                    <span class="vorb-core"></span>
                    <span class="vorb-spark"></span>
                </div>
            </div>
            <div id="voiceSiriText" onclick="_voiceWaveClick()" style="font-size:14px;min-height:22px;text-align:center;color:#94a3b8;font-style:italic;line-height:1.55;word-break:break-word;">请说话…</div>
            <div id="voiceSiriBarge" style="display:none;margin-top:8px;text-align:center;font-size:11px;color:#64748b;cursor:pointer;" onclick="_voiceStopSpeaking()">⏸ 直接开口、点击声波或按 Esc 打断</div>
            <div id="voiceSiriSuggest" style="display:none;margin-top:10px;text-align:center;"></div>
        `;
        Object.assign(card.style, {
            position:'fixed', bottom:'92px',
            left:'50%', transform:'translateX(-50%) translateY(16px)',
            zIndex:'9999', width:'344px',
            color:'#1f2937', borderRadius:'28px', padding:'16px 18px 20px',
            backdropFilter:'blur(26px) saturate(1.6)', WebkitBackdropFilter:'blur(26px) saturate(1.6)',
            boxShadow:'0 24px 60px -12px rgba(37,99,235,0.28), 0 10px 34px rgba(15,23,42,0.13), inset 0 1px 0 rgba(255,255,255,0.85)',
            display:'none', opacity:'0', transition:'opacity 0.3s ease, transform 0.34s cubic-bezier(0.34,1.45,0.5,1)',
            overflow:'hidden',
            /* light frosted background + subtle aurora + shimmer border are defined in the stylesheet (#voiceSiriCard) */
        });
        document.body.appendChild(card);

        // Pulse ring around mic button
        const ring = document.createElement('div');
        ring.id = 'voicePulseRing';
        Object.assign(ring.style, {
            position:'fixed', bottom:'20px', right:'20px', zIndex:'9997',
            width:'60px', height:'60px', borderRadius:'50%',
            border:'2px solid rgba(124,58,237,0.5)',
            animation:'vsRing 1.6s ease-in-out infinite',
            display:'none', pointerEvents:'none',
        });
        document.body.appendChild(ring);

        if (!document.getElementById('voiceCtrlStyle')) {
            const s = document.createElement('style');
            s.id = 'voiceCtrlStyle';
            s.textContent = `
                @keyframes vsBlink { 0%,100%{opacity:1} 50%{opacity:0.25} }
                /* ───── Light frosted "aurora" container (matches the light site) ───── */
                @property --vangle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
                #voiceSiriCard {
                    background:
                        radial-gradient(60% 55% at 16% 6%,  rgba(37,99,235,0.11), transparent 60%),
                        radial-gradient(55% 50% at 92% 92%, rgba(45,212,191,0.11), transparent 60%),
                        radial-gradient(52% 48% at 82% 22%, rgba(124,58,237,0.09), transparent 60%),
                        rgba(255,255,255,0.84);
                    background-size: 210% 210%, 210% 210%, 220% 220%, 100% 100%;
                    animation: vAurora 18s ease-in-out infinite alternate;
                }
                /* soft shimmering gradient border (masked ring) — gentle on light, not neon */
                #voiceSiriCard::before {
                    content:''; position:absolute; inset:0; border-radius:inherit; padding:1.4px; pointer-events:none; opacity:0.5;
                    background: conic-gradient(from var(--vangle), rgba(37,99,235,0.55), rgba(124,58,237,0.5) 30%, rgba(45,212,191,0.55) 60%, rgba(37,99,235,0.55));
                    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor; mask-composite: exclude;
                }
                @keyframes vAurora { 0%{background-position:0% 0%,100% 100%,50% 0%,0 0} 100%{background-position:38% 26%,62% 74%,22% 46%,0 0} }
                /* light glassy circular control buttons */
                #voiceSiriCard .vbtn { width:30px; height:30px; border-radius:50%; border:1px solid rgba(15,23,42,0.08); background:rgba(15,23,42,0.05); color:#475569; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s ease; }
                #voiceSiriCard .vbtn:hover { background:rgba(37,99,235,0.12); color:#2563EB; transform:scale(1.1); box-shadow:0 0 14px rgba(37,99,235,0.3); }
                #voiceSiriCard .vbtn-close:hover { color:#dc2626; background:rgba(239,68,68,0.12); box-shadow:0 0 14px rgba(239,68,68,0.3); }
                /* ───── Lively voice orb ───── */
                #voiceSiriOrb {
                    --lvl: 0;
                    position:relative; width:84px; height:84px; border-radius:50%;
                    background:
                        radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(255,255,255,0) 36%),
                        radial-gradient(circle at 70% 75%, #2DD4BF 0%, rgba(45,212,191,0) 55%),
                        radial-gradient(circle at 50% 50%, #7C3AED 18%, #2563EB 72%);
                    box-shadow: 0 0 38px 6px rgba(37,99,235,0.55), 0 0 80px 12px rgba(124,58,237,0.35), inset 0 -8px 22px rgba(0,0,0,0.35), inset 0 6px 16px rgba(255,255,255,0.25);
                    transform: scale(calc(1 + var(--lvl) * 0.32));
                    transition: transform 0.09s ease-out, filter 0.4s ease, box-shadow 0.4s ease;
                    will-change: transform;
                }
                #voiceSiriOrb .vorb-sheen {
                    position:absolute; inset:-2px; border-radius:50%;
                    background: conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.55) 70deg, rgba(45,212,191,0.5) 150deg, rgba(255,255,255,0) 220deg, rgba(124,58,237,0.5) 300deg, rgba(255,255,255,0) 360deg);
                    mix-blend-mode: screen; opacity:0.6;
                }
                #voiceSiriOrb .vorb-core {
                    position:absolute; inset:24%; border-radius:50%;
                    background: radial-gradient(circle at 40% 35%, rgba(255,255,255,0.9), rgba(255,255,255,0.05) 70%);
                    opacity:0.85; animation: vorbBreathe 3.4s ease-in-out infinite;
                }
                #voiceSiriOrb .vorb-spark {
                    position:absolute; top:20%; left:26%; width:14px; height:14px; border-radius:50%;
                    background: radial-gradient(circle, #fff, rgba(255,255,255,0) 70%); opacity:0.8; filter:blur(1px);
                }
                #voiceSiriOrbWrap .vorb-ripple {
                    position:absolute; width:84px; height:84px; border-radius:50%;
                    border:1.5px solid rgba(96,165,250,0.5); opacity:0; pointer-events:none;
                }
                @keyframes vorbBreathe { 0%,100%{ transform:scale(0.92); opacity:0.7 } 50%{ transform:scale(1.06); opacity:1 } }
                @keyframes vorbIdle    { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.045) } }
                @keyframes vorbPulse   { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.11) } }
                @keyframes vorbRipple  { 0%{ transform:scale(0.7); opacity:0.55 } 100%{ transform:scale(2.1); opacity:0 } }
                /* state: idle — gentle breathing */
                #voiceSiriOrb.idle { animation: none; }
                /* state: listening — brighter, faster sheen, reactive scale + ripples */
                #voiceSiriOrb.listening { filter:brightness(1.12) saturate(1.15); }
                #voiceSiriOrb.listening .vorb-sheen { opacity:0.8; }
                #voiceSiriOrbWrap.on .vorb-ripple  { animation: vorbRipple 2.4s ease-out infinite; }
                #voiceSiriOrbWrap.on .vorb-ripple2 { animation-delay:0.8s; }
                #voiceSiriOrbWrap.on .vorb-ripple3 { animation-delay:1.6s; }
                /* state: thinking — amber shimmer, fast spin */
                #voiceSiriOrb.thinking { filter:hue-rotate(-35deg) brightness(1.1) saturate(1.3); animation: none; }
                #voiceSiriOrb.thinking .vorb-sheen { opacity:0.95; }
                /* state: speaking — teal pulse */
                #voiceSiriOrb.speaking { filter:hue-rotate(15deg) brightness(1.15); animation: vorbPulse 0.85s ease-in-out infinite; }
                #voiceSiriOrb.speaking .vorb-sheen { opacity:0.82; }
                @keyframes voiceFlashAnim { 0%{box-shadow:0 0 0 0 rgba(124,58,237,0.55), inset 0 0 0 2px rgba(124,58,237,0.6);} 100%{box-shadow:0 0 0 14px rgba(124,58,237,0), inset 0 0 0 2px rgba(124,58,237,0);} }
                .voice-flash { animation:voiceFlashAnim 1.3s ease-out; }
                @keyframes voiceBtnGlow { 0%,100%{ box-shadow:0 4px 20px rgba(99,102,241,0.5); filter:brightness(1); } 50%{ box-shadow:0 6px 26px rgba(99,102,241,0.68); filter:brightness(1.05); } }
                #voiceCtrlBtn:hover { filter:brightness(1.08)!important; box-shadow:0 6px 28px rgba(99,102,241,0.68)!important; }
                #voiceCtrlBtn { animation: voiceBtnGlow 3.8s ease-in-out infinite; }
                #voiceCtrlBtn.active { background:linear-gradient(135deg,#7C3AED,#2563EB)!important; box-shadow:0 6px 28px rgba(124,58,237,0.7), 0 0 24px 4px rgba(37,99,235,0.5)!important; animation:none!important; }
                #voiceCtrlBtn.thinking { background:linear-gradient(135deg,#D97706,#F59E0B)!important; box-shadow:0 4px 20px rgba(245,158,11,0.6)!important; }
                :fullscreen #voiceCtrlBtn, :-webkit-full-screen #voiceCtrlBtn { bottom:24px!important; right:24px!important; z-index:2147483640!important; }
                :fullscreen #voiceWakeToggle, :-webkit-full-screen #voiceWakeToggle { bottom:84px!important; right:24px!important; z-index:2147483640!important; }
                :fullscreen #voiceSiriCard, :-webkit-full-screen #voiceSiriCard { bottom:90px!important; z-index:2147483641!important; }
                :fullscreen #voicePulseRing, :-webkit-full-screen #voicePulseRing { bottom:20px!important; right:20px!important; z-index:2147483639!important; }
                body.quick-design-open #voiceCtrlBtn {
                    right: 18px!important;
                    bottom: 24px!important;
                    width: 48px!important;
                    height: 48px!important;
                    opacity: 0.9!important;
                    z-index: 3003!important;
                }
                body.quick-design-open #voiceWakeToggle {
                    right: 74px!important;
                    bottom: 34px!important;
                    z-index: 3003!important;
                }
                body.quick-design-open #voiceSiriCard {
                    left: auto!important;
                    right: 18px!important;
                    bottom: 82px!important;
                    width: 156px!important;
                    max-height: 68px!important;
                    padding: 8px 9px!important;
                    border-radius: 14px!important;
                    overflow: hidden!important;
                    z-index: 3002!important;
                }
                body.quick-design-open #voiceSiriCard #voiceSiriOrbWrap {
                    display: none!important;
                }
                body.quick-design-open #voiceSiriCard #voiceSiriLog,
                body.quick-design-open #voiceSiriCard #voiceSiriSuggest,
                body.quick-design-open #voiceSiriCard .vbtn { display:none!important; }
                body.quick-design-open #voiceSiriCard #voiceSiriText {
                    font-size: 11px!important;
                    line-height: 1.3!important;
                    text-align:left!important;
                    min-height:0!important;
                    max-height:28px!important;
                    overflow:hidden!important;
                }
                body.quick-design-open #voicePulseRing { right: 12px!important; bottom: 18px!important; z-index: 3001!important; }
                @media (min-width: 641px) and (max-width: 1099px) {
                    body.quick-design-open #voiceSiriCard {
                        right: 14px!important;
                        top: auto!important;
                        bottom: calc(82px + env(safe-area-inset-bottom))!important;
                        width: 156px!important;
                        padding: 7px 8px!important;
                    }
                    body.quick-design-open #voiceSiriCard #voiceSiriOrbWrap,
                    body.quick-design-open #voiceSiriCard #voiceSiriLog,
                    body.quick-design-open #voiceSiriCard #voiceSiriSuggest { display:none!important; }
                    body.quick-design-open #voiceSiriCard #voiceSiriText {
                        text-align:left!important;
                        font-size:11px!important;
                    }
                }
                @media (min-width: 1100px) and (max-width: 1240px) {
                    body.quick-design-open #voiceSiriCard {
                        right: 16px!important;
                        width: 188px!important;
                        padding: 10px 11px 12px!important;
                    }
                    body.quick-design-open #voiceSiriCard #voiceSiriOrbWrap {
                        display:none!important;
                    }
                    body.quick-design-open #voiceSiriCard #voiceSiriLog { max-height: 56px!important; }
                }
                @media (max-width: 640px) {
                    body.chatting-mode:not(.quick-design-open) #voiceCtrlBtn {
                        right: 16px!important;
                        bottom: calc(128px + env(safe-area-inset-bottom))!important;
                    }
                    body.chatting-mode:not(.quick-design-open) #voiceWakeToggle {
                        right: 16px!important;
                        bottom: calc(188px + env(safe-area-inset-bottom))!important;
                    }
                    body.chatting-mode:not(.quick-design-open) #voiceSiriCard {
                        bottom: calc(188px + env(safe-area-inset-bottom))!important;
                        width: calc(100vw - 24px)!important;
                    }
                    body.chatting-mode:not(.quick-design-open) #voicePulseRing {
                        right: 12px!important;
                        bottom: calc(124px + env(safe-area-inset-bottom))!important;
                    }
                    body.quick-design-open #voiceCtrlBtn {
                        right: 14px!important;
                        bottom: calc(128px + env(safe-area-inset-bottom))!important;
                        width: 46px!important;
                        height: 46px!important;
                        opacity: 0.9!important;
                    }
                    body.quick-design-open #voiceWakeToggle {
                        right: 64px!important;
                        bottom: calc(136px + env(safe-area-inset-bottom))!important;
                        padding: 4px 10px!important;
                        min-width: 58px!important;
                        opacity: 0.9!important;
                    }
                    body.quick-design-open #voiceSiriCard {
                        right: 12px!important;
                        top: auto!important;
                        bottom: calc(82px + env(safe-area-inset-bottom))!important;
                        width: min(156px, calc(100vw - 24px))!important;
                        padding: 7px 8px!important;
                    }
                    body.quick-design-open #voiceSiriCard #voiceSiriOrbWrap,
                    body.quick-design-open #voiceSiriCard #voiceSiriLog,
                    body.quick-design-open #voiceSiriCard #voiceSiriSuggest,
                    body.quick-design-open #voiceSiriCard .vbtn { display:none!important; }
                    body.quick-design-open #voiceSiriCard #voiceSiriText {
                        text-align:left!important;
                        font-size:10.5px!important;
                        line-height:1.25!important;
                        min-height:0!important;
                        max-height:28px!important;
                        overflow:hidden!important;
                    }
                    body.quick-design-open #voicePulseRing {
                        right: 10px!important;
                        bottom: calc(122px + env(safe-area-inset-bottom))!important;
                        width: 56px!important;
                        height: 56px!important;
                    }
                }
            `;
            document.head.appendChild(s);
        }

        // ── Browser compatibility check ──
        _voiceCheckBrowser();

        // ── Keyboard shortcut: Space to toggle, Esc to interrupt speech ──
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && _voiceActive && _voiceIsSpeaking()) {
                e.preventDefault();
                _voiceStopSpeaking({ source: 'escape' });
                return;
            }
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
                e.preventDefault();
                toggleVoiceControl();
            }
        });

        // ── Demo mode: ?demo=1 in URL auto-starts voice ──
        if (new URLSearchParams(location.search).get('demo') === '1') {
            setTimeout(() => startVoiceControl(), 1200);
        }

        // ── Pre-request mic permission on page load (avoid popup during demo) ──
        if (navigator.mediaDevices && navigator.permissions) {
            navigator.permissions.query({name:'microphone'}).then(r => {
                if (r.state === 'prompt') {
                    // Silently request so browser caches permission
                    navigator.mediaDevices.getUserMedia({audio:true}).then(s => s.getTracks().forEach(t=>t.stop())).catch(()=>{});
                }
            }).catch(()=>{});
        }
    }

    function toggleVoiceControl() {
        _unlockAudio();   // user gesture → keep audio playback unlocked for the session
        if (_voiceActive) stopVoiceControl();
        else startVoiceControl();
    }

    // ── Wake word (opt-in hands-free): say "小诺" to activate the assistant ──
    const _WAKE_PHRASES = ['小诺','你好小诺','小诺同学','嗨小诺','小喏','小糯','晓诺'];
    function _wakeMatched(t) {
        const s = (t || '').replace(/\s/g, '');
        return _WAKE_PHRASES.some(p => s.includes(p));
    }

    function _startWakeWord() {
        if (!_wakeEnabled || _voiceActive) return;
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
        if (_wakeRecog) return; // already running
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = 'zh-CN'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 3;
        rec.onresult = (e) => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const r = e.results[i];
                for (let j = 0; j < r.length; j++) {
                    if (_wakeMatched(r[j].transcript)) {
                        _stopWakeWord();
                        showToast('已唤醒 ZoonoAb 语音助手', 'success');
                        startVoiceControl();
                        return;
                    }
                }
            }
        };
        rec.onerror = (ev) => { if (ev.error === 'not-allowed') { _wakeEnabled = false; _updateWakeBtn(); } };
        rec.onend = () => {
            _wakeRecog = null;
            if (_wakeEnabled && !_voiceActive) {
                clearTimeout(_wakeRestartTimer);
                _wakeRestartTimer = setTimeout(_startWakeWord, 400);  // Chrome ends sessions periodically
            }
        };
        try { rec.start(); _wakeRecog = rec; } catch(e) { _wakeRecog = null; }
    }

    function _stopWakeWord() {
        clearTimeout(_wakeRestartTimer);
        if (_wakeRecog) {
            // Hard teardown: detach ALL handlers (so buffered results can't re-fire startVoiceControl) + abort
            try { _wakeRecog.onresult = null; _wakeRecog.onerror = null; _wakeRecog.onend = null; _wakeRecog.abort(); } catch(e){}
            _wakeRecog = null;
        }
    }

    function toggleWakeWord() {
        _unlockAudio();   // this click is a user gesture → unlock audio so wake-activated TTS can play
        _wakeEnabled = !_wakeEnabled;
        try { localStorage.setItem('zoo_wake', _wakeEnabled ? '1' : '0'); } catch(e){}
        _updateWakeBtn();
        if (_wakeEnabled) {
            showToast('免提模式已开启 — 说"小诺"即可唤醒', 'success');
            if (!_voiceActive) _startWakeWord();
        } else {
            showToast('免提模式已关闭', 'info');
            _stopWakeWord();
        }
    }

    function _updateWakeBtn() {
        const b = document.getElementById('voiceWakeToggle');
        if (!b) return;
        b.style.background = _wakeEnabled ? 'linear-gradient(135deg,#10B981,#059669)' : 'rgba(30,41,59,0.85)';
        b.style.color = _wakeEnabled ? 'white' : 'rgba(255,255,255,0.7)';
        b.title = _wakeEnabled ? '免提唤醒：开（说"小诺"唤醒）— 点击关闭' : '免提唤醒：关 — 点击开启，之后说"小诺"即可免提唤醒';
        b.innerHTML = (_wakeEnabled ? '🟢' : '💤') + ' 免提';
    }

    function _voiceSessionId() {
        return (typeof window !== 'undefined' && window.voiceSessionId) ? window.voiceSessionId : '';
    }

    function startVoiceControl() {
        if (_voiceActive) return;   // idempotent — repeated wake triggers must not start a 2nd session
        _stopWakeWord();  // assistant takes over the mic
        _voiceActive = true;
        _voiceRestartCount = 0;
        _voiceQueue = [];
        _voiceProcessing = false;
        document.getElementById('voiceCtrlBtn').classList.add('active');
        document.getElementById('voicePulseRing').style.display = 'block';
        _voiceSetState('show');
        _voiceSetState('listening');
        showToast('语音助手已开启（快捷键：空格键）', 'success');
        _voiceStartAudioMeter();
        _voicePreflightCheck();
        // Brief spoken greeting (小诺 persona) + starter prompts so clients know what to say
        setTimeout(() => { if (_voiceActive) speakVoice(_voiceGreeting()); }, 250);
        setTimeout(() => { if (_voiceActive) _voiceShowStarters(); }, 550);

        // Try DashScope Paraformer first; fall back to Web Speech API on error
        if (ws && ws.readyState === 1) {
            _asrDashscope = true;
            ws.send(JSON.stringify({ type: 'asr_start', voiceSessionId: _voiceSessionId() }));
            // asr_ready → _asrBeginCapture(); asr_error → _startWebSpeechASR() fallback
        } else {
            _asrDashscope = false;
            _startWebSpeechASR();
        }
    }

    // ── DashScope Paraformer: begin PCM capture after server says ready ──
    function _asrCalcRms(samples) {
        if (!samples || !samples.length) return 0;
        let sum = 0;
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        return Math.sqrt(sum / samples.length);
    }

    function _asrResetSegmentState() {
        _asrSpeechStarted = false;
        _asrLastSpeechAt = 0;
        _asrSegmentStartedAt = 0;
        _asrListenStartedAt = Date.now();
        _asrPeakRms = 0;
        _asrFinishPending = false;
        _asrPreRoll = [];
        _asrBargeFrames = 0;
    }

    function _asrFinishSegment(reason) {
        if (_asrFinishPending) return;
        _asrFinishPending = true;
        const now = Date.now();
        const duration = _asrSegmentStartedAt ? now - _asrSegmentStartedAt : 0;
        const shouldSubmit = reason === 'stop' || reason === 'max' || (_asrSpeechStarted && duration >= _ASR_MIN_SEGMENT_MS);
        _asrCleanup();
        if (shouldSubmit && ws && ws.readyState === 1) {
            document.getElementById('voiceCtrlBtn')?.classList.add('thinking');
            _voiceSetState('thinking', '正在识别语音...');
            ws.send(JSON.stringify({ type: 'asr_stop' }));
        } else {
            _asrResetSegmentState();
            if (_voiceActive && _asrDashscope && reason !== 'stop') {
                if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: 'asr_stop' }));
            }
        }
    }

    function _asrBeginCapture() {
        if (!_asrDashscope || !_voiceActive) return;
        _asrResetSegmentState();
        navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
            video: false
        })
            .then(stream => {
                if (!_voiceActive) { stream.getTracks().forEach(t => t.stop()); return; }
                _asrMicStream = stream;
                // 16 kHz AudioContext so ScriptProcessor output is already 16-bit PCM at the right rate
                _asrAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                const src = _asrAudioCtx.createMediaStreamSource(stream);
                // 2048 samples keeps barge-in responsive while staying stable on mobile browsers.
                _asrProcessor = _asrAudioCtx.createScriptProcessor(2048, 1, 1);
                _asrProcessor.onaudioprocess = (e) => {
                    if (_asrFinishPending || !_voiceActive || !_asrDashscope) return;
                    if (!ws || ws.readyState !== 1) return;
                    const f32 = e.inputBuffer.getChannelData(0);
                    const rms = _asrCalcRms(f32);
                    const now = Date.now();
                    _asrPeakRms = Math.max(_asrPeakRms, rms);
                    const orb = document.getElementById('voiceSiriOrb');
                    if (orb && orb.classList.contains('listening')) {
                        orb.style.setProperty('--lvl', Math.min(1, rms * 26).toFixed(2));
                    }
                    const pcm = new Int16Array(f32.length);
                    for (let i = 0; i < f32.length; i++) {
                        pcm[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767)));
                    }
                    const pcmBuffer = pcm.buffer.slice(0);
                    let currentBufferSent = false;

                    if (_voicePausedForTTS) {
                        _asrPreRoll.push(pcmBuffer);
                        while (_asrPreRoll.length > _ASR_PREROLL_CHUNKS) _asrPreRoll.shift();
                        if (_VAD_BARGE_ENABLED && _voiceIsSpeaking && _voiceIsSpeaking() && rms >= _ASR_BARGE_RMS) {
                            _asrBargeFrames++;
                            if (_asrBargeFrames >= _ASR_BARGE_FRAMES && _voiceRequestBargeIn('asr')) {
                                _asrBargeFrames = 0;
                                _asrSpeechStarted = true;
                                _asrSegmentStartedAt = now;
                                _asrLastSpeechAt = now;
                                _voiceSetState('interim', '我在听，请继续说...');
                                _asrPreRoll.forEach(buf => { if (ws && ws.readyState === 1) ws.send(buf); });
                                currentBufferSent = true;
                                _asrPreRoll = [];
                            } else {
                                return;
                            }
                        } else {
                            _asrBargeFrames = Math.max(0, _asrBargeFrames - 1);
                            return;
                        }
                    }

                    if (!_asrSpeechStarted) {
                        _asrPreRoll.push(pcmBuffer);
                        while (_asrPreRoll.length > _ASR_PREROLL_CHUNKS) _asrPreRoll.shift();
                        if (rms >= _ASR_START_RMS) {
                            _asrSpeechStarted = true;
                            _asrSegmentStartedAt = now;
                            _asrLastSpeechAt = now;
                            _voiceSetState('interim', '我听到了，请继续说...');
                            _asrPreRoll.forEach(buf => { if (ws && ws.readyState === 1) ws.send(buf); });
                            currentBufferSent = true;
                            _asrPreRoll = [];
                        } else if (now - _asrListenStartedAt > _ASR_IDLE_HINT_MS) {
                            _asrListenStartedAt = now;
                            _voiceSetState('listening', '没有听到清晰声音，请靠近麦克风说话...');
                        } else {
                            return;
                        }
                    } else if (rms >= _ASR_CONTINUE_RMS) {
                        _asrLastSpeechAt = now;
                        _asrBargeFrames = 0;
                    }
                    if (!currentBufferSent) ws.send(pcmBuffer);
                    if (_asrSpeechStarted && now - _asrSegmentStartedAt >= _ASR_MAX_SEGMENT_MS) {
                        _asrFinishSegment('max');
                        return;
                    }
                    if (_asrSpeechStarted && _asrLastSpeechAt && now - _asrLastSpeechAt >= _ASR_SILENCE_MS) {
                        _asrFinishSegment('silence');
                    }
                };
                src.connect(_asrProcessor);
                _asrProcessor.connect(_asrAudioCtx.destination);
            })
            .catch(err => {
                console.warn('[ASR] mic access failed:', err.message);
                _asrDashscope = false;
                _startWebSpeechASR();
            });
    }

    function _asrCleanup() {
        if (_asrProcessor) { try { _asrProcessor.disconnect(); } catch(e){} _asrProcessor = null; }
        if (_asrAudioCtx)  { try { _asrAudioCtx.close(); }       catch(e){} _asrAudioCtx  = null; }
        if (_asrMicStream) { _asrMicStream.getTracks().forEach(t => t.stop()); _asrMicStream = null; }
    }

    function _asrRestartSession() {
        if (!_asrDashscope || !_voiceActive) return;
        _asrCleanup();
        setTimeout(() => {
            if (_asrDashscope && _voiceActive && ws && ws.readyState === 1) {
                _asrResetSegmentState();
                ws.send(JSON.stringify({ type: 'asr_start', voiceSessionId: _voiceSessionId() }));
            }
        }, 160);
    }

    // ── Web Speech API fallback ──
    function _startWebSpeechASR() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            showToast('请使用 Google Chrome 浏览器，语音功能不支持当前浏览器', 'error');
            return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        _voiceRecog = new SR();
        _voiceRecog.lang = 'zh-CN';
        _voiceRecog.continuous = true;
        _voiceRecog.interimResults = true;
        _voiceRecog.maxAlternatives = 5;

        _voiceRecog.onresult = (e) => {
            let interimText = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (!e.results[i].isFinal) {
                    interimText += e.results[i][0].transcript;
                } else {
                    const alts = Array.from({length: e.results[i].length}, (_,j) => e.results[i][j].transcript.trim());
                    document.getElementById('voiceCtrlBtn')?.classList.add('thinking');
                    processVoiceText(alts).finally(() => {
                        document.getElementById('voiceCtrlBtn')?.classList.remove('thinking');
                    });
                }
            }
            if (interimText) _voiceSetState('interim', interimText);
        };
        _voiceRecog.onerror = (e) => {
            if (e.error === 'no-speech') return;
            if (e.error === 'not-allowed') {
                showToast('麦克风权限被拒绝，请在浏览器地址栏点锁形图标允许麦克风', 'error');
                stopVoiceControl();
            }
        };
        _voiceRecog.onend = () => {
            if (!_voiceActive) return;
            if (_voicePausedForTTS) return;
            _voiceRestartCount++;
            clearTimeout(_voiceRestartTimer);
            _voiceRestartTimer = setTimeout(() => { _voiceRestartCount = 0; }, 60000);
            if (_voiceRestartCount > 20) {
                _voiceSetState('response', '识别服务不稳定，请刷新页面后重试');
                _voiceRestartCount = 0;
                return;
            }
            try { _voiceRecog.start(); } catch(e) {}
        };
        try { _voiceRecog.start(); } catch(e) {}
    }

    function stopVoiceControl() {
        _voiceActive = false;
        clearTimeout(_voiceFeedbackTimer);
        clearTimeout(_voiceRestartTimer);
        _voiceQueue = [];
        _voiceProcessing = false;
        clearTimeout(_voiceAgentTimer);
        _stopCurrentTTS();
        const _bargeEl = document.getElementById('voiceSiriBarge'); if (_bargeEl) _bargeEl.style.display = 'none';
        const _logEl = document.getElementById('voiceSiriLog'); if (_logEl) { _logEl.innerHTML = ''; _logEl.style.display = 'none'; }
        if (_voiceRecog) { try { _voiceRecog.stop(); } catch(e){} _voiceRecog = null; }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        _voiceStopAudioMeter();
        // DashScope ASR cleanup
        if (_asrDashscope) {
            _asrDashscope = false;
            const shouldStopAsr = !_asrFinishPending;
            _asrCleanup();
            if (shouldStopAsr && ws && ws.readyState === 1) ws.send(JSON.stringify({ type: 'asr_stop' }));
        }
        const btn  = document.getElementById('voiceCtrlBtn');
        const ring = document.getElementById('voicePulseRing');
        if (btn)  { btn.classList.remove('active'); btn.classList.remove('thinking'); }
        if (ring) ring.style.display = 'none';
        _voiceSetState('hide');
        showToast('语音助手已关闭', 'info');
        // Resume hands-free wake-word listening if it was enabled
        if (_wakeEnabled) { clearTimeout(_wakeRestartTimer); _wakeRestartTimer = setTimeout(_startWakeWord, 600); }
    }

    function showVoiceFeedback(text, autoHide = true) {
        updateVoiceBar({ heard: '', response: text });
    }

    function showVoiceHelp() {
        const ov = document.createElement('div');
        ov.id = 'voiceHelpOverlay';
        Object.assign(ov.style, {
            position:'fixed',inset:'0',background:'rgba(0,0,0,0.55)',zIndex:'10000',
            display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'
        });
        const groups = [
            { title: '🧬 快速设计向导', cmds: ['打开快速设计','开始设计','肿瘤','PD-L1','启动 AI 分子设计'] },
            { title: '当前步骤选项', cmds: ['自身免疫','过敏','感染','HER2','EGFR','VEGF-A','自动选择表位'] },
            { title: '向导控制', cmds: ['下一步','上一步','关闭快速设计','关闭语音'] },
        ];
        const rows = groups.map(g => `
            <div style="margin-bottom:16px;">
                <div style="font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${g.title}</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${g.cmds.map(c=>`<span style="padding:3px 10px;background:rgba(0,123,255,0.1);border:1px solid rgba(0,123,255,0.25);border-radius:20px;font-size:12px;color:var(--text-primary);">${c}</span>`).join('')}
                </div>
            </div>`).join('');
        ov.innerHTML = `
            <div style="background:var(--bg-card);border-radius:20px;padding:28px;max-width:520px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                    <div style="font-size:18px;font-weight:700;color:var(--text-primary);">🎤 语音控制命令列表</div>
                    <button onclick="document.getElementById('voiceHelpOverlay').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted);line-height:1;">&times;</button>
                </div>
                <div style="margin-bottom:16px;padding:10px 14px;background:var(--bg-light);border-radius:10px;font-size:12px;color:var(--text-secondary);">
                    当前语音用于网站功能控制和站内问答，不会把识别内容写入主输入框、聊天区或普通工作流。只有在快速设计最后确认页说"启动 AI 分子设计"才会开始设计。<b>小诺说话时直接开口、点卡片或按 Esc 可打断</b>。开启右下角 <b>"💤 免提"</b> 后，直接说 <b>"小诺"</b> 即可免提唤醒。
                </div>
                ${rows}
            </div>`;
        ov.addEventListener('click', e => { if(e.target === ov) ov.remove(); });
        document.body.appendChild(ov);
    }

    function openNewBatchModal() {
        switchView('chat');
        setTimeout(() => {
            const inp = document.getElementById('userInput');
            if (inp) {
                inp.placeholder = '描述新批次任务，例如：从头设计 20 条抗 HER2 VHH 抗体...';
                inp.focus();
            }
            showToast('请在对话中描述批次任务，系统将按当前流程执行', 'info');
        }, 200);
    }

    function voiceControlHandleWsMessage(msg) {
        if (!msg || !msg.type) return false;
        switch (msg.type) {
            case 'voice_say':
                if (_voiceActive && !_voiceMuted && msg.text) {
                    clearTimeout(_voiceAgentTimer);
                    _voiceSetState('response', msg.text);
                    _voicePushTranscript('ai', msg.text);
                    speakVoiceStreaming(msg.text);
                    return true;
                }
                return false;
            case 'asr_ready':
                _asrBeginCapture();
                return true;
            case 'asr_text':
                if (_asrDashscope && _voiceActive) {
                    _asrInterimText = msg.text || '';
                    _voiceSetState('interim', msg.text || '');
                    if (msg.final && msg.text) {
                        _asrFinishPending = false;
                        _asrInterimText = '';
                        document.getElementById('voiceCtrlBtn')?.classList.add('thinking');
                        processVoiceText([msg.text]).finally(() => {
                            document.getElementById('voiceCtrlBtn')?.classList.remove('thinking');
                        });
                    }
                    return true;
                }
                return false;
            case 'asr_done':
                if (_asrDashscope && _voiceActive) {
                    document.getElementById('voiceCtrlBtn')?.classList.remove('thinking');
                    if (_asrFinishPending && !_asrInterimText) {
                        _voiceSetState('response', '没有听清，请再说一遍');
                    }
                    _asrFinishPending = false;
                    _asrInterimText = '';
                    _asrRestartSession();
                    return true;
                }
                return false;
            case 'asr_error':
                if (_asrDashscope && _voiceActive) {
                    console.warn('[ASR] local error:', msg.message);
                    _asrDashscope = false;
                    _asrCleanup();
                    _startWebSpeechASR();
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    window.processVoiceText = processVoiceText;
    window.voiceToggleMute = voiceToggleMute;
    window.toggleVoiceControl = toggleVoiceControl;
    window.toggleWakeWord = toggleWakeWord;
    window.startVoiceControl = startVoiceControl;
    window.stopVoiceControl = stopVoiceControl;
    window.showVoiceHelp = showVoiceHelp;
    window._voiceStopSpeaking = _voiceStopSpeaking;
    window._voiceWaveClick = _voiceWaveClick;
    window.voiceControlHandleWsMessage = voiceControlHandleWsMessage;

    // Initialize only after all global handlers are exposed. The voice card uses inline
    // handlers for a few controls, so exposing them first keeps manual interrupt reliable.
    document.addEventListener('DOMContentLoaded', initVoiceControlUI);
    if (document.readyState !== 'loading') initVoiceControlUI();
