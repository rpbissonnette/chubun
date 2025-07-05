
class MandarinTrainer {
    constructor() {
        this.currentTone = 1;
        this.currentSyllable = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.studentAudio = null;
        this.referenceAudio = null;
        this.practicedSyllables = new Set();
        this.audioContext = null;
        this.analyzer = null;
        this.pitchData = [];

        this.initializeElements();
        this.setupEventListeners();
        this.setupAudioContext();
        this.updateDebugInfo('Initialized - Ready to practice!');
    }

    initializeElements() {
        this.elements = {
            toneButtons: document.querySelectorAll('.tone-btn'),
            syllables: document.querySelectorAll('.syllable'),
            currentPinyin: document.getElementById('current-pinyin'),
            toneDisplay: document.getElementById('tone-display'),
            playReference: document.getElementById('play-reference'),
            recordBtn: document.getElementById('record-btn'),
            playRefComparison: document.getElementById('play-ref-comparison'),
            playStudentComparison: document.getElementById('play-student-comparison'),
            pitchCanvas: document.getElementById('pitch-canvas'),
            practicedCount: document.getElementById('practiced-count'),
            qualityScore: document.getElementById('quality-score'),
            toneAccuracy: document.getElementById('tone-accuracy'),
            progressFill: document.getElementById('progress-fill'),
            debugInfo: document.getElementById('debug-info')
        };
    }

    updateDebugInfo(message) {
        const timestamp = new Date().toLocaleTimeString();
        const debugMessage = `[${timestamp}] ${message}`;

        // Update the debug display element if it exists
        if (this.elements.debugInfo) {
            this.elements.debugInfo.textContent = debugMessage;
        }

        // Also log to console for debugging
        console.log(debugMessage);
    }
    
    setupEventListeners() {
        // Tone selection
        this.elements.toneButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTone(parseInt(e.target.dataset.tone));
            });
        });

        // Syllable selection
        this.elements.syllables.forEach(syllable => {
            syllable.addEventListener('click', (e) => {
                this.selectSyllable(e.target.dataset.pinyin);
            });
        });

        // Audio controls
        this.elements.playReference.addEventListener('click', () => this.playReference());
        this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.elements.playRefComparison.addEventListener('click', () => this.playReference());
        this.elements.playStudentComparison.addEventListener('click', () => this.playStudentRecording());
    }

    async setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = 2048;
            this.updateDebugInfo('Audio context initialized');
        } catch (error) {
            this.updateDebugInfo('Audio context failed: ' + error.message);
        }
    }

    selectTone(tone) {
        this.currentTone = tone;

        // Update UI
        this.elements.toneButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tone="${tone}"]`).classList.add('active');

        this.updateCurrentDisplay();
        this.updateDebugInfo(`Tone ${tone} selected`);
    }

    selectSyllable(pinyin) {
        if (!pinyin) return;

        this.currentSyllable = pinyin;

        // Update UI
        this.elements.syllables.forEach(syl => {
            syl.classList.remove('selected');
        });
        document.querySelector(`[data-pinyin="${pinyin}"]`).classList.add('selected');

        this.updateCurrentDisplay();
        this.updateDebugInfo(`Syllable "${pinyin}" selected with tone ${this.currentTone}`);
    }

    updateCurrentDisplay() {
        if (this.currentSyllable) {
            this.elements.currentPinyin.textContent = this.currentSyllable;
            this.elements.toneDisplay.textContent = this.getToneDescription(this.currentTone);
        } else {
            this.elements.currentPinyin.textContent = '选择音节';
            this.elements.toneDisplay.textContent = 'Select a syllable';
        }
    }

    getToneDescription(tone) {
        const descriptions = {
            1: 'First Tone - High Level (55)',
            2: 'Second Tone - Rising (35)',
            3: 'Third Tone - Falling-Rising (214)',
            4: 'Fourth Tone - Falling (51)'
        };
        return descriptions[tone] || 'Unknown Tone';
    }

    playReference() {
        if (!this.currentSyllable) {
            this.updateDebugInfo('No syllable selected');
            return;
        }

        // Generate synthetic reference audio (placeholder)
        this.generateReferenceAudio(this.currentSyllable, this.currentTone);
        this.updateDebugInfo(`Playing reference: ${this.currentSyllable}${this.currentTone}`);
    }

    playStudentRecording() {
        if (!this.studentAudio) {
            this.updateDebugInfo('No student recording available');
            return;
        }

        const audio = new Audio(this.studentAudio);
        audio.play().then(() => {
            this.updateDebugInfo('Playing student recording');
        }).catch(error => {
            this.updateDebugInfo('Error playing student recording: ' + error.message);
        });
    }

    generateReferenceAudio(syllable, tone) {
        if (!this.audioContext) return;

        // Create a synthetic tone pattern based on Mandarin tone contours
        const duration = 0.8; // seconds
        const baseFreq = 200; // Hz
        const sampleRate = this.audioContext.sampleRate;
        const frameCount = sampleRate * duration;

        const audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = audioBuffer.getChannelData(0);

        // Generate tone contour
        for (let i = 0; i < frameCount; i++) {
            const t = i / frameCount;
            let freq = baseFreq;

            // Apply tone contour
            switch (tone) {
                case 1: // High level
                    freq = baseFreq * 1.3;
                    break;
                case 2: // Rising
                    freq = baseFreq * (1.0 + 0.5 * t);
                    break;
                case 3: // Falling-rising
                    freq = baseFreq * (1.2 - 0.4 * Math.sin(Math.PI * t));
                    break;
                case 4: // Falling
                    freq = baseFreq * (1.4 - 0.6 * t);
                    break;
            }

            // Generate sine wave with envelope
            const envelope = Math.sin(Math.PI * t) * 0.3;
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope;
        }

        // Play the generated audio
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.start();

        // Draw pitch contour
        this.drawPitchContour(tone, true);
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        if (!this.currentSyllable) {
            this.updateDebugInfo('No syllable selected for recording');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            // Update UI
            this.elements.recordBtn.textContent = '⏹️ Stop Recording';
            this.elements.recordBtn.classList.add('recording');

            this.updateDebugInfo(`Recording ${this.currentSyllable}${this.currentTone}...`);

            // Auto-stop after 3 seconds
            setTimeout(() => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            }, 3000);

        } catch (error) {
            this.updateDebugInfo('Microphone access denied: ' + error.message);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Update UI
            this.elements.recordBtn.textContent = '🎤 Record';
            this.elements.recordBtn.classList.remove('recording');

            this.updateDebugInfo('Recording stopped, processing...');
        }
    }

    processRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
        this.studentAudio = URL.createObjectURL(blob);

        // Mark syllable as practiced
        this.practicedSyllables.add(`${this.currentSyllable}${this.currentTone}`);

        // Show analysis section
        this.showAnalysisSection();

        // Analyze the recording
        this.analyzeRecording(blob);

        // Clean up recorded chunks
        this.recordedChunks = [];

        // Update practice progress
        this.updatePracticeProgress();
    }

    showAnalysisSection() {
        const analysisSection = document.getElementById('analysis-section');
        if (analysisSection) {
            analysisSection.style.display = 'block';
            analysisSection.innerHTML = `
                <div class="analysis-container">
                    <h3>📊 Pronunciation Analysis</h3>
                    <div class="audio-comparison">
                        <div class="audio-player">
                            <h4>🎯 Reference Audio</h4>
                            <audio controls>
                                <source src="${this.referenceAudio}" type="audio/wav">
                            </audio>
                        </div>
                        <div class="audio-player">
                            <h4>🎤 Your Recording</h4>
                            <audio controls>
                                <source src="${this.studentAudio}" type="audio/wav">
                            </audio>
                        </div>
                    </div>
                    <div class="analysis-results" id="analysis-results">
                        <div class="loading">Analyzing your pronunciation...</div>
                    </div>
                </div>
            `;
        }
    }

    async analyzeRecording(blob) {
        try {
            // Convert blob to audio buffer for analysis
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Perform basic audio analysis
            const analysis = await this.performAudioAnalysis(audioBuffer);

            // Generate instructor feedback
            const feedback = this.generateInstructorFeedback(analysis);

            // Display results
            this.displayAnalysisResults(analysis, feedback);

        } catch (error) {
            console.error('Error analyzing recording:', error);
            this.displayAnalysisError();
        }
    }

    async performAudioAnalysis(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        // Basic pitch detection using autocorrelation
        const pitch = this.detectPitch(channelData, sampleRate);

        // Analyze tone contour
        const toneContour = this.analyzeToneContour(channelData, sampleRate);

        // Calculate audio features
        const features = {
            duration: audioBuffer.duration,
            averagePitch: pitch.average,
            pitchRange: pitch.range,
            toneContour: toneContour,
            volume: this.calculateRMS(channelData),
            clarity: this.calculateClarity(channelData)
        };

        return features;
    }

    detectPitch(audioData, sampleRate) {
        // Simple autocorrelation-based pitch detection
        const windowSize = Math.floor(sampleRate * 0.1); // 100ms window
        const pitches = [];

        for (let i = 0; i < audioData.length - windowSize; i += windowSize / 2) {
            const window = audioData.slice(i, i + windowSize);
            const pitch = this.autocorrelationPitch(window, sampleRate);
            if (pitch > 0) pitches.push(pitch);
        }

        return {
            average: pitches.reduce((a, b) => a + b, 0) / pitches.length || 0,
            range: Math.max(...pitches) - Math.min(...pitches) || 0,
            contour: pitches
        };
    }

    autocorrelationPitch(buffer, sampleRate) {
        const minPeriod = Math.floor(sampleRate / 500); // 500 Hz max
        const maxPeriod = Math.floor(sampleRate / 80);  // 80 Hz min

        let bestCorrelation = -1;
        let bestPeriod = -1;

        for (let period = minPeriod; period < maxPeriod; period++) {
            let correlation = 0;
            for (let i = 0; i < buffer.length - period; i++) {
                correlation += buffer[i] * buffer[i + period];
            }

            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestPeriod = period;
            }
        }

        return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
    }

    analyzeToneContour(audioData, sampleRate) {
        const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
        const contour = [];

        for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
            const window = audioData.slice(i, i + windowSize);
            const pitch = this.autocorrelationPitch(window, sampleRate);
            contour.push(pitch);
        }

        // Normalize and smooth contour
        const maxPitch = Math.max(...contour.filter(p => p > 0));
        const minPitch = Math.min(...contour.filter(p => p > 0));

        return contour.map(pitch => {
            if (pitch <= 0) return 0;
            return (pitch - minPitch) / (maxPitch - minPitch);
        });
    }

    calculateRMS(audioData) {
        const sum = audioData.reduce((acc, val) => acc + val * val, 0);
        return Math.sqrt(sum / audioData.length);
    }

    calculateClarity(audioData) {
        // Simple clarity metric based on signal-to-noise ratio
        const rms = this.calculateRMS(audioData);
        const peak = Math.max(...audioData.map(Math.abs));
        return peak > 0 ? rms / peak : 0;
    }

    generateInstructorFeedback(analysis) {
        const getTranslation = window.getTranslation;
        const expectedTone = this.getToneExpectation(this.currentTone);
        const feedback = {
            overall: getTranslation("feedback.overallGood"),
            pitch: '',
            tone: '',
            suggestions: []
        };

        // Analyze pitch accuracy
        if (analysis.averagePitch < expectedTone.pitchRange.min) {
            feedback.pitch = getTranslation("feedback.pitchLow");
            feedback.suggestions.push(getTranslation("feedback.suggestionPitchLow"));
        } else if (analysis.averagePitch > expectedTone.pitchRange.max) {
            feedback.pitch = getTranslation("feedback.pitchHigh");
            feedback.suggestions.push(getTranslation("feedback.suggestionPitchHigh"));
        } else {
            feedback.pitch = getTranslation("feedback.pitchGood");
        }

        // Analyze tone contour
        const toneAccuracy = this.compareToneContours(analysis.toneContour, expectedTone.contour);

        if (toneAccuracy > 0.8) {
            feedback.tone = getTranslation("feedback.toneExcellent");
            feedback.overall = getTranslation("feedback.overallExcellent");
        } else if (toneAccuracy > 0.6) {
            feedback.tone = getTranslation("feedback.toneGood");
            feedback.overall = getTranslation("feedback.overallGoodProgress");
        } else {
            feedback.tone = getTranslation("feedback.toneNeedsWork");
            feedback.overall = getTranslation("feedback.overallNeedsWork");
            feedback.suggestions.push(getTranslation("feedback.suggestionTone"));
        }

        // Volume and clarity feedback
        if (analysis.volume < 0.1) {
            feedback.suggestions.push(getTranslation("feedback.suggestionClarity"));
        }

        if (analysis.clarity < 0.3) {
            feedback.suggestions.push(getTranslation("feedback.suggestionArticulation"));
        }

        return feedback;
    }

    getToneExpectation(tone) {
        const expectations = {
            1: { // High level
                pitchRange: { min: 180, max: 220 },
                contour: [0.8, 0.8, 0.8, 0.8, 0.8] // Flat high
            },
            2: { // Rising
                pitchRange: { min: 150, max: 200 },
                contour: [0.2, 0.4, 0.6, 0.8, 1.0] // Rising
            },
            3: { // Falling-rising
                pitchRange: { min: 140, max: 180 },
                contour: [0.6, 0.3, 0.2, 0.4, 0.7] // Dip then rise
            },
            4: { // Falling
                pitchRange: { min: 160, max: 200 },
                contour: [1.0, 0.8, 0.6, 0.4, 0.2] // Falling
            }
        };

        return expectations[tone] || expectations[1];
    }

    compareToneContours(recorded, expected) {
        if (!recorded || !expected || recorded.length === 0) return 0;

        // Normalize both contours to same length
        const normalizedRecorded = this.normalizeContour(recorded, expected.length);
        const normalizedExpected = expected;

        // Calculate correlation coefficient
        let correlation = 0;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

        for (let i = 0; i < normalizedExpected.length; i++) {
            const x = normalizedRecorded[i] || 0;
            const y = normalizedExpected[i];

            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
            sumY2 += y * y;
        }

        const n = normalizedExpected.length;
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator !== 0 ? Math.abs(numerator / denominator) : 0;
    }

    normalizeContour(contour, targetLength) {
        if (contour.length === targetLength) return contour;

        const normalized = [];
        const ratio = contour.length / targetLength;

        for (let i = 0; i < targetLength; i++) {
            const index = Math.floor(i * ratio);
            normalized.push(contour[index] || 0);
        }

        return normalized;
    }

    displayAnalysisResults(analysis, feedback) {
        const resultsDiv = document.getElementById('analysis-results');
        if (!resultsDiv) return;

        resultsDiv.innerHTML = `
            <div class="feedback-card">
                <div class="overall-feedback ${this.getFeedbackClass(feedback.overall)}">
                    <h4>${feedback.overall}</h4>
                </div>
                
                <div class="detailed-feedback">
                    <div class="feedback-item">
                        <strong>🎵 Pitch:</strong> ${feedback.pitch}
                    </div>
                    <div class="feedback-item">
                        <strong>📈 Tone:</strong> ${feedback.tone}
                    </div>
                    
                    ${feedback.suggestions.length > 0 ? `
                        <div class="suggestions">
                            <strong>💡 Suggestions:</strong>
                            <ul>
                                ${feedback.suggestions.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="audio-features">
                    <h4>📊 Technical Analysis</h4>
                    <div class="features-grid">
                        <div class="feature">
                            <span class="label">Duration:</span>
                            <span class="value">${analysis.duration.toFixed(1)}s</span>
                        </div>
                        <div class="feature">
                            <span class="label">Avg Pitch:</span>
                            <span class="value">${analysis.averagePitch.toFixed(0)} Hz</span>
                        </div>
                        <div class="feature">
                            <span class="label">Pitch Range:</span>
                            <span class="value">${analysis.pitchRange.toFixed(0)} Hz</span>
                        </div>
                        <div class="feature">
                            <span class="label">Clarity:</span>
                            <span class="value">${(analysis.clarity * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getFeedbackClass(feedback) {
        if (feedback.includes('Excellent')) return 'excellent';
        if (feedback.includes('Good')) return 'good';
        return 'needs-practice';
    }

    displayAnalysisError() {
        const resultsDiv = document.getElementById('analysis-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="error-message">
                    <h4>❌ Analysis Error</h4>
                    <p>Sorry, we couldn't analyze your recording. Please try again.</p>
                </div>
            `;
        }
    }

    updatePracticeProgress() {
        const totalSyllables = this.syllables.length * 4; // 4 tones each
        const practiced = this.practicedSyllables.size;
        const progress = (practiced / totalSyllables) * 100;

        const progressElement = document.getElementById('practice-progress');
        if (progressElement) {
            progressElement.innerHTML = `
                <div class="progress-info">
                    <span>Progress: ${practiced}/${totalSyllables} combinations</span>
                    <span>${progress.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            `;
        }
    }
}

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    const trainer = new MandarinTrainer();
});