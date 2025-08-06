// databutter - Main Application
// Orchestrates the buttery animation framework with performance monitoring

// Application state
const AppState = {
    animationEngine: null,
    debugMode: false,
    currentPreset: 'custom',
    isAnimating: false
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧈 databutter initializing...');
    
    // Check if required libraries are loaded
    if (!validateDependencies()) {
        return;
    }
    
    // Initialize the buttery animation engine
    initializeAnimationEngine();
    
    // Set up global event handlers
    setupGlobalEventHandlers();
    
    // Initialize UI state
    initializeUI();
    
    // Start performance monitoring display
    startPerformanceDisplay();
    
    // Auto-play after a short delay
    setTimeout(() => {
        console.log('🎬 Auto-playing initial buttery animation...');
        AppState.animationEngine.play();
    }, 1000);
    
    console.log('✨ databutter ready for buttery magic!');
});

function validateDependencies() {
    const dependencies = [
        { name: 'GSAP', check: () => typeof gsap !== 'undefined' },
        { name: 'D3', check: () => typeof d3 !== 'undefined' },
        { name: 'Performance Monitor', check: () => window.performanceMonitor },
        { name: 'Sample Data', check: () => typeof sampleData !== 'undefined' }
    ];
    
    const missing = dependencies.filter(dep => !dep.check());
    
    if (missing.length > 0) {
        console.error('❌ Missing dependencies:', missing.map(dep => dep.name));
        showError(`Missing required dependencies: ${missing.map(dep => dep.name).join(', ')}`);
        return false;
    }
    
    return true;
}

function initializeAnimationEngine() {
    try {
        // Create the buttery animation engine with performance constraints
        AppState.animationEngine = new ButteryAnimationEngine(sampleData, '#chartSvg', {
            // Start with dramatic preset for impressive first impression
            ...AnimationPresets['dramatic-presentation']
        });
        
        // Make it globally accessible for debugging
        window.animationEngine = AppState.animationEngine;
        
        console.log('🎭 Buttery Animation Engine initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize animation engine:', error);
        showError('Failed to initialize animation engine. Check console for details.');
    }
}

function setupGlobalEventHandlers() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent shortcuts during animation to avoid conflicts
        if (AppState.isAnimating && e.code !== 'Escape') {
            return;
        }
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (AppState.animationEngine.isPlaying) {
                    AppState.animationEngine.reset();
                } else {
                    AppState.animationEngine.play();
                }
                break;
                
            case 'KeyR':
                e.preventDefault();
                AppState.animationEngine.reset();
                break;
                
            case 'KeyD':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleDebugMode();
                }
                break;
                
            case 'KeyN':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    AppState.animationEngine.randomizeData();
                }
                break;
                
            case 'Escape':
                if (AppState.animationEngine.isPlaying) {
                    e.preventDefault();
                    AppState.animationEngine.reset();
                }
                break;
        }
    });
    
    // Window resize handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (AppState.animationEngine) {
                AppState.animationEngine.setupChart();
            }
        }, 300);
    });
    
    // Page visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && AppState.animationEngine.isPlaying) {
            AppState.animationEngine.reset();
        }
    });
}

function initializeUI() {
    // Set up preset selector
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
        presetSelect.value = 'dramatic-presentation';
        AppState.currentPreset = 'dramatic-presentation';
    }
    
    // Update data story display
    updateDataStoryDisplay();
    
    // Initialize debug panel state
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
        debugPanel.style.display = 'none';
    }
    
    // Set initial performance mode display
    updatePerformanceModeDisplay('high');
}

function startPerformanceDisplay() {
    if (!window.performanceMonitor) return;
    
    // Update debug info every second
    setInterval(updateDebugInfo, 1000);
    
    // Listen for performance changes
    window.performanceMonitor.onPerformanceChange((fps, level, constraints) => {
        updatePerformanceModeDisplay(level);
        
        if (AppState.debugMode) {
            updateDebugInfo();
        }
    });
}

function updateDataStoryDisplay() {
    const dataStoryEl = document.getElementById('dataStory');
    if (dataStoryEl) {
        const stories = Object.values(dataStory).map(story => story.name).join(' • ');
        dataStoryEl.textContent = stories;
    }
}

function updatePerformanceModeDisplay(level) {
    const performanceMode = document.getElementById('performanceMode');
    const statusBar = document.getElementById('statusBar');
    
    if (!performanceMode || !statusBar) return;
    
    const modes = {
        high: {
            text: 'High Performance Mode',
            color: 'var(--success-color)',
            status: '🚀 All animation effects enabled'
        },
        medium: {
            text: 'Medium Performance Mode', 
            color: 'var(--warning-color)',
            status: '⚡ Some effects optimized'
        },
        low: {
            text: 'Low Performance Mode',
            color: 'var(--danger-color)', 
            status: '🛡️ Performance protection active'
        }
    };
    
    const mode = modes[level] || modes.high;
    
    performanceMode.textContent = mode.text;
    performanceMode.style.color = mode.color;
    
    // Update status if not currently animating
    if (!AppState.isAnimating) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = mode.status;
        }
    }
}


    
    // Update UI controls to reflect preset values
    updateControlsFromParameters();
    
    // Update current preset
    AppState.currentPreset = presetName;
    
    // Show feedback
    showStatus(`✨ Applied preset: ${preset.name}`, 3000);
}

function updateControlsFromParameters() {
    if (!AppState.animationEngine) return;
    
    const params = AppState.animationEngine.animationParams;
    
    // Update all form controls based on current parameters
    const controlUpdates = [
        // Squash & Stretch
        { id: 'squashEnabled', path: 'squashAndStretch.enabled', type: 'checkbox' },
        { id: 'squashAmount', path: 'squashAndStretch.squashAmount', type: 'range' },
        { id: 'stretchAmount', path: 'squashAndStretch.stretchAmount', type: 'range' },
        { id: 'squashDuration', path: 'squashAndStretch.squashDuration', type: 'range' },
        
        // Anticipation
        { id: 'anticipationEnabled', path: 'anticipation.enabled', type: 'checkbox' },
        { id: 'pullbackAmount', path: 'anticipation.pullbackAmount', type: 'range' },
        { id: 'pauseDuration', path: 'anticipation.pauseDuration', type: 'range' },
        
        // Follow Through
        { id: 'followThroughEnabled', path: 'followThrough.enabled', type: 'checkbox' },
        { id: 'overshootAmount', path: 'followThrough.overshootAmount', type: 'range' },
        { id: 'settleDuration', path: 'followThrough.settleDuration', type: 'range' },
        
        // Easing
        { id: 'mainEase', path: 'easing.mainActionEase', type: 'select' },
        { id: 'adaptiveEasing', path: 'easing.adaptiveEasing', type: 'checkbox' },
        
        // Secondary Action
        { id: 'secondaryActionEnabled', path: 'secondaryAction.enabled', type: 'checkbox' },
        { id: 'jiggleIntensity', path: 'secondaryAction.jiggleIntensity', type: 'range' },
        { id: 'organicVariation', path: 'secondaryAction.microVariations', type: 'checkbox' },
        
        // Timing
        { id: 'baseDuration', path: 'timing.baseDuration', type: 'range' },
        { id: 'staggerDelay', path: 'timing.staggerDelay', type: 'range' },
        { id: 'accelerando', path: 'timing.accelerando', type: 'checkbox' },
        { id: 'timingVariation', path: 'timing.organicVariation', type: 'range' },
        { id: 'dramaticPauses', path: 'timing.dramaticPauses', type: 'checkbox' },
        { id: 'maxSegments', path: 'timing.maxSegments', type: 'range' }
    ];
    
    controlUpdates.forEach(({ id, path, type }) => {
        const element = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        if (!element) return;
        
        const value = AppState.animationEngine.getParameter(path);
        
        if (type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
        
        // Update value display
        if (valueDisplay && type === 'range') {
            AppState.animationEngine.updateValueDisplay(valueDisplay, value, type);
        }
    });
}

// Debug Mode
function toggleDebugMode() {
    AppState.debugMode = !AppState.debugMode;
    
    const debugPanel = document.getElementById('debugPanel');
    const debugBtn = document.getElementById('debugBtn');
    
    if (debugPanel) {
        debugPanel.style.display = AppState.debugMode ? 'block' : 'none';
    }
    
    if (debugBtn) {
        debugBtn.textContent = AppState.debugMode ? '🔧 Debug: ON' : '🔧 Debug Mode';
    }
    
    if (AppState.debugMode) {
        updateDebugInfo();
        console.log('🔧 Debug mode enabled');
    } else {
        console.log('🔧 Debug mode disabled');
    }
}

function updateDebugInfo() {
    if (!AppState.debugMode) return;
    
    // Performance metrics
    const performanceMetrics = document.getElementById('performanceMetrics');
    if (performanceMetrics && window.performanceMonitor) {
        const metrics = window.performanceMonitor.getMetrics();
        performanceMetrics.textContent = JSON.stringify(metrics, null, 2);
    }
    
    // Animation parameters
    const animationParameters = document.getElementById('animationParameters');
    if (animationParameters && AppState.animationEngine) {
        const params = {
            isPlaying: AppState.animationEngine.isPlaying,
            currentPreset: AppState.currentPreset,
            animationParams: AppState.animationEngine.animationParams
        };
        animationParameters.textContent = JSON.stringify(params, null, 2);
    }
    
    // Timeline debug
    const timelineDebug = document.getElementById('timelineDebug');
    if (timelineDebug && AppState.animationEngine.timeline) {
        const timelineInfo = {
            duration: AppState.animationEngine.timeline.duration(),
            progress: AppState.animationEngine.timeline.progress(),
            isActive: AppState.animationEngine.timeline.isActive(),
            totalProgress: AppState.animationEngine.timeline.totalProgress()
        };
        timelineDebug.textContent = JSON.stringify(timelineInfo, null, 2);
    }
}

// Settings Import/Export
function exportSettings() {
    if (!AppState.animationEngine) return;
    
    const settings = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        preset: AppState.currentPreset,
        parameters: AppState.animationEngine.animationParams,
        metadata: {
            userAgent: navigator.userAgent,
            performanceLevel: window.performanceMonitor?.performanceLevel || 'unknown'
        }
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `databutter-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showStatus('📁 Settings exported successfully', 2000);
}

function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const settings = JSON.parse(e.target.result);
            
            if (!settings.version || !settings.parameters) {
                throw new Error('Invalid settings file format');
            }
            
            // Apply imported parameters
            AppState.animationEngine.animationParams = AppState.animationEngine.deepMerge(
                AppState.animationEngine.animationParams,
                settings.parameters
            );
            
            // Update preset selector
            const presetSelect = document.getElementById('presetSelect');
            if (presetSelect) {
                presetSelect.value = settings.preset || 'custom';
                AppState.currentPreset = settings.preset || 'custom';
            }
            
            // Update controls
            updateControlsFromParameters();
            
            showStatus('📂 Settings imported successfully', 2000);
            
        } catch (error) {
            console.error('❌ Failed to import settings:', error);
            showError('Failed to import settings. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Utility Functions
function showStatus(message, duration = 5000) {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    const originalMessage = statusEl.textContent;
    statusEl.textContent = message;
    
    setTimeout(() => {
        if (statusEl.textContent === message) {
            statusEl.textContent = originalMessage;
        }
    }, duration);
}

function showError(message) {
    const statusBar = document.getElementById('statusBar');
    if (!statusBar) {
        console.error(message);
        return;
    }
    
    statusBar.innerHTML = `
        <span style="color: var(--danger-color);">❌ ${message}</span>
        <button onclick="location.reload()" style="background: var(--danger-color); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Reload Page
        </button>
    `;
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('🚨 Application error:', e.error);
    
    if (e.error?.message?.includes('Performance')) {
        showError('Performance issue detected. Some animations may be disabled.');
    } else {
        showError(`Application error: ${e.error?.message || 'Unknown error'}`);
    }
});

// Performance warning for mobile devices
if (navigator.userAgent.includes('Mobile')) {
    setTimeout(() => {
        console.log('📱 Mobile device detected - optimizing for performance');
        if (window.performanceMonitor && AppState.animationEngine) {
            // Apply mobile-optimized settings
            AppState.animationEngine.animationParams.timing.maxSegments = 2;
            AppState.animationEngine.animationParams.secondaryAction.jiggleIntensity = 0.5;
            AppState.animationEngine.animationParams.timing.organicVariation = 0.1;
        }
    }, 2000);
}

// Export for debugging
window.AppState = AppState;

console.log('🧈 databutter app module loaded');

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        applyPreset,
        toggleDebugMode,
        exportSettings,
        importSettings
    };
}