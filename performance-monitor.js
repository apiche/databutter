// databutter - Buttery Performance Monitor
// FPS tracking and adaptive scaling for buttery smooth experiences

class ButteryPerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.performanceLevel = 'high';
        this.monitoring = true;
        this.callbacks = [];
        
        this.startMonitoring();
        console.log('📊 Buttery performance monitoring started');
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
                
                this.updatePerformanceLevel();
                this.notifyCallbacks();
                this.updateUI();
            }
            
            requestAnimationFrame(tick);
        };
        
        requestAnimationFrame(tick);
    }
    
    updatePerformanceLevel() {
        const previousLevel = this.performanceLevel;
        
        if (this.fps < 30) {
            this.performanceLevel = 'low';
        } else if (this.fps < 50) {
            this.performanceLevel = 'medium';
        } else {
            this.performanceLevel = 'high';
        }
        
        if (previousLevel !== this.performanceLevel) {
            console.log(`📈 Performance: ${previousLevel} → ${this.performanceLevel} (${this.fps} FPS)`);
            this.adaptForPerformance();
        }
    }
    
    adaptForPerformance() {
        // Simple adaptation for current system
        if (this.performanceLevel === 'low' && window.animationEngine) {
            console.log('🛡️ Reducing animation duration for better performance');
            
            const engine = window.animationEngine;
            if (engine.animationParams) {
                // Reduce duration when performance is poor
                engine.animationParams.drawingDuration = Math.min(
                    engine.animationParams.drawingDuration, 
                    1.5
                );
                
                // Reduce leading edge bulge complexity
                engine.animationParams.leadingEdgeBulge = Math.min(
                    engine.animationParams.leadingEdgeBulge,
                    0.1
                );
            }
            
            this.showPerformanceWarning();
        }
    }
    
    showPerformanceWarning() {
        const warning = document.getElementById('performanceWarning');
        if (warning) {
            warning.style.display = 'block';
            warning.textContent = `⚠️ Performance mode: ${this.performanceLevel} (${this.fps} FPS) - Animation optimized for smoother playback`;
        }
    }
    
    hidePerformanceWarning() {
        const warning = document.getElementById('performanceWarning');
        if (warning) {
            warning.style.display = 'none';
        }
    }
    
    updateUI() {
        // Update FPS display
        const fpsDisplay = document.getElementById('fpsDisplay');
        if (fpsDisplay) {
            fpsDisplay.textContent = this.fps;
            
            // Color-code FPS display
            if (this.fps >= 50) {
                fpsDisplay.style.color = '#27ae60'; // Green
            } else if (this.fps >= 30) {
                fpsDisplay.style.color = '#f39c12'; // Yellow
            } else {
                fpsDisplay.style.color = '#e74c3c'; // Red
            }
        }
        
        // Show/hide warning based on performance
        if (this.performanceLevel === 'high') {
            this.hidePerformanceWarning();
        }
    }
    
    // Future-ready: Performance constraints for complex features
    getComplexityConstraints() {
        const constraints = {
            high: {
                maxWaveComplexity: 1.0,      // Full wave detail
                curveSmoothing: 8,           // Look ahead 8 pixels
                maxLookupDensity: 1,         // Every pixel
                allowParticleEffects: true
            },
            medium: {
                maxWaveComplexity: 0.7,      // Reduced wave detail
                curveSmoothing: 4,           // Look ahead 4 pixels  
                maxLookupDensity: 0.5,       // Every 2 pixels
                allowParticleEffects: true
            },
            low: {
                maxWaveComplexity: 0.3,      // Simple waves only
                curveSmoothing: 2,           // Look ahead 2 pixels
                maxLookupDensity: 0.25,      // Every 4 pixels
                allowParticleEffects: false
            }
        };
        
        return constraints[this.performanceLevel];
    }
    
    // Callback system for performance changes
    onPerformanceChange(callback) {
        this.callbacks.push(callback);
    }
    
    notifyCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback(this.fps, this.performanceLevel, this.getComplexityConstraints());
            } catch (error) {
                console.error('Performance callback error:', error);
            }
        });
    }
    
    // Diagnostic info
    getMetrics() {
        return {
            currentFPS: this.fps,
            performanceLevel: this.performanceLevel,
            constraints: this.getComplexityConstraints()
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

// Auto-initialize buttery performance monitoring
window.performanceMonitor = new ButteryPerformanceMonitor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ButteryPerformanceMonitor };
}