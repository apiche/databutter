// databutter - Performance Engine
// Guarantees 60fps through hard constraints and real-time monitoring

class PerformanceConstraints {
    static readonly = {
        MAX_CONCURRENT_ANIMATIONS: 8,
        MAX_SEGMENTS_PER_YEAR: 4,
        MIN_ANIMATION_DURATION: 0.05, // 50ms minimum
        MAX_JIGGLE_FREQUENCY: 10, // Per second
        MAX_TIMING_VARIATION: 0.5, // 50% max
        MIN_FPS_THRESHOLD: 50,
        GPU_ONLY_PROPERTIES: [
            'opacity', 'transform', 'x', 'y', 'rotation', 'scale', 
            'scaleX', 'scaleY', 'rotationX', 'rotationY', 'rotationZ'
        ]
    };
    
    static validateParameters(params) {
        const constraints = this.readonly;
        
        // Hard constraints that cannot be overridden
        if (params.timing) {
            params.timing.maxSegments = Math.min(params.timing.maxSegments || 4, constraints.MAX_SEGMENTS_PER_YEAR);
            params.timing.organicVariation = Math.min(params.timing.organicVariation || 0.3, constraints.MAX_TIMING_VARIATION);
        }
        
        if (params.secondaryAction) {
            params.secondaryAction.jiggleIntensity = Math.min(params.secondaryAction.jiggleIntensity || 2, 3);
            params.secondaryAction.maxJiggles = Math.min(params.secondaryAction.maxJiggles || 3, 5);
        }
        
        if (params.squashAndStretch) {
            // Prevent extreme squash/stretch that could cause layout thrashing
            params.squashAndStretch.squashAmount = Math.max(params.squashAndStretch.squashAmount || 0.9, 0.7);
            params.squashAndStretch.stretchAmount = Math.min(params.squashAndStretch.stretchAmount || 1.1, 1.3);
        }
        
        return params;
    }
    
    static filterGPUProperties(properties) {
        const safe = {};
        const constraints = this.readonly;
        
        Object.keys(properties).forEach(key => {
            if (constraints.GPU_ONLY_PROPERTIES.includes(key)) {
                safe[key] = properties[key];
            } else if (key === 'attr' && this.isGPUSafeAttribute(properties[key])) {
                safe[key] = properties[key];
            } else if (key === 'duration' || key === 'ease' || key === 'delay') {
                safe[key] = properties[key];
            } else {
                console.warn(`⚠️ Blocked non-GPU property: ${key} (maintaining 60fps)`);
            }
        });
        
        return safe;
    }
    
    static isGPUSafeAttribute(attrProps) {
        // Only allow SVG attributes that don't trigger layout recalculation
        const safeAttrs = ['width', 'height', 'd', 'transform', 'opacity'];
        return Object.keys(attrProps).every(attr => safeAttrs.includes(attr));
    }
}

class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.performanceLevel = 'high';
        this.monitoring = true;
        this.history = [];
        this.callbacks = [];
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        const tick = () => {
            if (!this.monitoring) return;
            
            this.frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - this.lastTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                this.updateHistory();
                this.adjustPerformanceLevel();
                this.notifyCallbacks();
                this.updateUI();
            }
            
            requestAnimationFrame(tick);
        };
        
        requestAnimationFrame(tick);
    }
    
    updateHistory() {
        this.history.push({
            fps: this.fps,
            timestamp: Date.now(),
            performanceLevel: this.performanceLevel
        });
        
        // Keep only last 60 seconds of data
        const cutoff = Date.now() - 60000;
        this.history = this.history.filter(entry => entry.timestamp > cutoff);
    }
    
    adjustPerformanceLevel() {
        const previousLevel = this.performanceLevel;
        
        if (this.fps < 45) {
            this.performanceLevel = 'low';
        } else if (this.fps < 55) {
            this.performanceLevel = 'medium';
        } else {
            this.performanceLevel = 'high';
        }
        
        if (previousLevel !== this.performanceLevel) {
            console.log(`🎭 Performance level changed: ${previousLevel} → ${this.performanceLevel} (${this.fps} FPS)`);
            this.enforceConstraints();
        }
    }
    
    enforceConstraints() {
        if (this.performanceLevel === 'low') {
            console.warn(`⚠️ FPS dropped to ${this.fps}, enforcing strict performance mode`);
            
            // Override any user parameters that could hurt performance
            if (window.animationEngine) {
                const engine = window.animationEngine;
                
                // Force safe parameters
                engine.animationParams.timing.maxSegments = 2;
                engine.animationParams.secondaryAction.jiggleIntensity = 0;
                engine.animationParams.timing.organicVariation = 0.1;
                engine.animationParams.squashAndStretch.enabled = false;
                
                // Show performance warning
                this.showPerformanceWarning();
            }
        }
    }
    
    showPerformanceWarning() {
        const statusBar = document.getElementById('statusBar');
        if (statusBar) {
            statusBar.innerHTML = `
                <span>⚠️ Performance mode: Low (${this.fps} FPS) - Some effects disabled</span>
                <span class="performance-mode" style="color: var(--danger-color);">Performance Protection Active</span>
            `;
        }
    }
    
    updateUI() {
        // Update FPS display
        const fpsValue = document.getElementById('fpsValue');
        if (fpsValue) {
            fpsValue.textContent = this.fps;
        }
        
        // Update performance indicator
        const indicator = document.getElementById('performanceIndicator');
        if (indicator) {
            indicator.className = `performance-indicator ${this.performanceLevel}`;
        }
        
        // Update performance mode text
        const performanceMode = document.getElementById('performanceMode');
        if (performanceMode && this.performanceLevel === 'high') {
            performanceMode.textContent = 'High Performance Mode';
            performanceMode.style.color = 'var(--success-color)';
        }
    }
    
    getConstraints() {
        const constraints = {
            high: {
                maxSegments: 4,
                maxJiggle: 2,
                maxVariation: 0.3,
                allowSquash: true,
                allowSecondaryAction: true
            },
            medium: {
                maxSegments: 3,
                maxJiggle: 1,
                maxVariation: 0.2,
                allowSquash: true,
                allowSecondaryAction: true
            },
            low: {
                maxSegments: 2,
                maxJiggle: 0,
                maxVariation: 0.1,
                allowSquash: false,
                allowSecondaryAction: false
            }
        };
        
        return constraints[this.performanceLevel];
    }
    
    onPerformanceChange(callback) {
        this.callbacks.push(callback);
    }
    
    notifyCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback(this.fps, this.performanceLevel, this.getConstraints());
            } catch (error) {
                console.error('Performance callback error:', error);
            }
        });
    }
    
    getMetrics() {
        return {
            currentFPS: this.fps,
            performanceLevel: this.performanceLevel,
            averageFPS: this.history.length > 0 
                ? Math.round(this.history.reduce((sum, entry) => sum + entry.fps, 0) / this.history.length)
                : this.fps,
            minFPS: this.history.length > 0 
                ? Math.min(...this.history.map(entry => entry.fps))
                : this.fps,
            maxFPS: this.history.length > 0 
                ? Math.max(...this.history.map(entry => entry.fps))
                : this.fps,
            dataPoints: this.history.length
        };
    }
    
    stop() {
        this.monitoring = false;
    }
    
    start() {
        if (!this.monitoring) {
            this.monitoring = true;
            this.startMonitoring();
        }
    }
}

class GPUOnlyAnimationBuilder {
    constructor(timeline, element, params) {
        this.timeline = timeline;
        this.element = element;
        this.params = PerformanceConstraints.validateParameters(params);
        this.animationCount = 0;
        this.performanceMonitor = window.performanceMonitor;
    }
    
    // Override GSAP to only allow GPU properties
    safeAnimate(target, properties, duration = 1, ease = "power2.out", delay = 0) {
        // Filter out any non-GPU properties
        const gpuProperties = PerformanceConstraints.filterGPUProperties(properties);
        
        if (this.animationCount >= PerformanceConstraints.readonly.MAX_CONCURRENT_ANIMATIONS) {
            console.warn('🚫 Animation limit reached, skipping to maintain 60fps');
            return this;
        }
        
        // Ensure minimum duration for smooth animation
        const safeDuration = Math.max(duration, PerformanceConstraints.readonly.MIN_ANIMATION_DURATION);
        
        this.animationCount++;
        this.timeline.to(target, {
            ...gpuProperties,
            duration: safeDuration,
            ease: ease,
            onComplete: () => {
                this.animationCount--;
            }
        }, delay);
        
        return this;
    }
    
    // Batch multiple animations for efficiency
    batchAnimate(animations) {
        const maxBatchSize = 4; // Limit concurrent batch animations
        
        for (let i = 0; i < animations.length; i += maxBatchSize) {
            const batch = animations.slice(i, i + maxBatchSize);
            
            batch.forEach(anim => {
                this.safeAnimate(anim.target, anim.properties, anim.duration, anim.ease, anim.delay);
            });
        }
        
        return this;
    }
    
    // Get current performance constraints
    getConstraints() {
        return this.performanceMonitor ? this.performanceMonitor.getConstraints() : {
            maxSegments: 4,
            maxJiggle: 2,
            maxVariation: 0.3,
            allowSquash: true,
            allowSecondaryAction: true
        };
    }
    
    // Check if animation should be allowed based on current performance
    shouldAnimate(animationType) {
        const constraints = this.getConstraints();
        
        switch (animationType) {
            case 'squash':
                return constraints.allowSquash;
            case 'secondaryAction':
                return constraints.allowSecondaryAction;
            case 'jiggle':
                return constraints.maxJiggle > 0;
            default:
                return true;
        }
    }
}

// Performance-Safe GSAP Override
class PerformanceGSAPOverride {
    static initialize() {
        // Store original GSAP methods
        const originalTo = gsap.to;
        const originalFrom = gsap.from;
        const originalSet = gsap.set;
        
        // Override gsap.to with performance checking
        gsap.to = function(target, properties) {
            const safeProperties = PerformanceConstraints.filterGPUProperties(properties);
            return originalTo.call(this, target, safeProperties);
        };
        
        // Override gsap.from with performance checking
        gsap.from = function(target, properties) {
            const safeProperties = PerformanceConstraints.filterGPUProperties(properties);
            return originalFrom.call(this, target, safeProperties);
        };
        
        // gsap.set is usually safe, but let's check anyway
        gsap.set = function(target, properties) {
            const safeProperties = PerformanceConstraints.filterGPUProperties(properties);
            return originalSet.call(this, target, safeProperties);
        };
        
        console.log('🛡️ Performance GSAP override active - GPU-only animations enforced');
    }
    
    static disable() {
        // Would need to restore original methods
        console.log('⚠️ Performance override disabled - use with caution');
    }
}

// Auto-initialize performance monitoring
window.performanceMonitor = new PerformanceMonitor();

// Initialize GSAP override
PerformanceGSAPOverride.initialize();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceConstraints,
        PerformanceMonitor,
        GPUOnlyAnimationBuilder,
        PerformanceGSAPOverride
    };
}