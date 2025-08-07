// databutter - Buttery Animation Engine (Performance Optimized)
// Reduced complexity to maintain 60fps

// databutter - Full Buttery Animation Engine
// All Disney principles with smooth drawing animations

class ButteryAnimationEngine {
    constructor(data, svgSelector, params = {}) {
        // Default animation parameters
        this.animationParams = {
            timing: {
                baseDuration: 1500,
                staggerDelay: 300
            },
            squashAndStretch: {
                enabled: true,
                squashAmount: 0.9,
                stretchAmount: 1.1,
                squashDuration: 0.15
            },
            anticipation: {
                enabled: true,
                pullbackAmount: 0.95,
                pauseDuration: 0.05
            },
            followThrough: {
                enabled: true,
                overshootAmount: 1.05,
                settleDuration: 0.2
            },
            secondaryAction: {
                enabled: true,
                jiggleIntensity: 1,
                maxJiggles: 3
            }
        };
        
        this.data = data;
        this.svg = d3.select(svgSelector);
        this.timeline = null;
        this.isPlaying = false;
        
        // Chart dimensions
        this.margin = { top: 20, right: 30, bottom: 40, left: 60 };
        this.width = 1000 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        
        this.setupChart();
        
        console.log('🎭 Buttery Animation Engine ready');
    }
    
    setupChart() {
        console.log('🎭 Setting up buttery smooth chart...');
        
        // Clear existing content
        this.svg.selectAll("*").remove();
        
        // Create main group
        this.chartGroup = this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        
        // Set up scales
        this.xScale = d3.scaleLinear()
            .domain([1, 15])
            .range([0, this.width]);
        
        this.yScale = d3.scaleLinear()
            .domain([0, DataUtils.getMaxValue() * 1.1])
            .range([this.height, 0]);
        
        // Add axes
        this.addAxes();
        
        // Create area generators
        this.areaGenerators = {
            year1: d3.area()
                .x(d => this.xScale(d.day))
                .y0(this.height)
                .y1(d => this.yScale(d.year1))
                .curve(d3.curveCardinal.tension(0.3)),
                
            year2: d3.area()
                .x(d => this.xScale(d.day))
                .y0(this.height)
                .y1(d => this.yScale(d.year2))
                .curve(d3.curveCardinal.tension(0.3)),
                
            year3: d3.area()
                .x(d => this.xScale(d.day))
                .y0(this.height)
                .y1(d => this.yScale(d.year3))
                .curve(d3.curveCardinal.tension(0.3))
        };
        
        // Create styled area paths (initially hidden)
        this.paths = {};
        
        // Year 1 - Red
        this.paths.year1 = this.chartGroup
            .append("path")
            .datum(this.data)
            .attr("class", "area-path year-1")
            .attr("d", this.areaGenerators.year1)
            .style("fill", "#e74c3c")
            .style("stroke", "#c0392b")
            .style("stroke-width", "2px")
            .style("fill-opacity", 0.7)
            .style("opacity", 0);
        
        // Year 2 - Orange
        this.paths.year2 = this.chartGroup
            .append("path")
            .datum(this.data)
            .attr("class", "area-path year-2")
            .attr("d", this.areaGenerators.year2)
            .style("fill", "#f39c12")
            .style("stroke", "#e67e22")
            .style("stroke-width", "2px")
            .style("fill-opacity", 0.7)
            .style("opacity", 0);
        
        // Year 3 - Green
        this.paths.year3 = this.chartGroup
            .append("path")
            .datum(this.data)
            .attr("class", "area-path year-3")
            .attr("d", this.areaGenerators.year3)
            .style("fill", "#27ae60")
            .style("stroke", "#229954")
            .style("stroke-width", "2px")
            .style("fill-opacity", 0.7)
            .style("opacity", 0);
        
        // Setup drawing masks for smooth reveal animation
        this.setupDrawingMasks();
        
        console.log('✨ Buttery chart ready for animation');
    }
    
    setupDrawingMasks() {
        // Create defs for masks
        const defs = this.svg.select("defs").empty() 
            ? this.svg.append("defs") 
            : this.svg.select("defs");
        
        // Create drawing masks for each year
        ['year1', 'year2', 'year3'].forEach(year => {
            const maskId = `draw-mask-${year}`;
            
            // Remove existing
            defs.select(`#${maskId}`).remove();
            
            // Create mask
            const mask = defs.append("mask").attr("id", maskId);
            
            // Reveal rectangle (starts at width 0, will animate to full width)
            mask.append("rect")
                .attr("width", 0)
                .attr("height", this.height + 20)
                .attr("y", -10)
                .attr("fill", "white")
                .attr("class", `reveal-${year}`);
            
            // Apply mask to path
            this.paths[year].attr("mask", `url(#${maskId})`);
        });
    }
    
    addAxes() {
        // X-axis
        this.chartGroup.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale)
                .ticks(15)
                .tickFormat(d => `Day ${d}`)
            );
        
        // Y-axis  
        this.chartGroup.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(this.yScale)
                .tickFormat(d3.format(".2s"))
            );
    }
    
    play() {
        // Default behavior: play all years
        this.playSelectedYears([1, 2, 3]);
    }
    
    playSelectedYears(selectedYears = [1, 2, 3]) {
        if (this.isPlaying) {
            console.log('🎭 Animation already playing');
            return;
        }
        
        if (selectedYears.length === 0) {
            console.log('⚠️ No years selected for animation');
            return;
        }
        
        console.log(`🎬 Starting BUTTERY SMOOTH animation for years: ${selectedYears.join(', ')}`);
        this.isPlaying = true;
        this.setPlayButtonState(true);
        
        // Kill existing timeline
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Create buttery timeline with all Disney principles
        this.timeline = gsap.timeline({
            onComplete: () => {
                console.log('✨ BUTTERY animation complete');
                this.isPlaying = false;
                this.setPlayButtonState(false);
            }
        });
        
        // Animate only selected years with staggered timing
        let staggerIndex = 0;
        selectedYears.forEach(yearNumber => {
            const yearKey = `year${yearNumber}`;
            const delay = staggerIndex * this.animationParams.timing.staggerDelay;
            this.animateYearButtery(yearKey, delay);
            staggerIndex++;
        });
    }
    
    animateYearButtery(year, delay) {
        const baseDuration = this.animationParams.timing.baseDuration / 1000;
        const element = this.paths[year].node();
        const revealElement = `.reveal-${year}`;
        
        console.log(`🧈 Animating ${year} with FULL BUTTER at ${delay}ms delay`);
        
        // === DISNEY PRINCIPLE 2: ANTICIPATION ===
        if (this.animationParams.anticipation.enabled) {
            this.timeline.to(element, {
                scaleX: this.animationParams.anticipation.pullbackAmount,
                transformOrigin: "center center",
                duration: 0.1,
                ease: "power2.in"
            }, delay / 1000);
            
            // Pause for anticipation
            this.timeline.to({}, { 
                duration: this.animationParams.anticipation.pauseDuration 
            });
        }
        
        // === DISNEY PRINCIPLE 1: SQUASH & STRETCH ===
        if (this.animationParams.squashAndStretch.enabled) {
            // SQUASH - compress before reveal
            this.timeline.to(element, {
                scaleY: this.animationParams.squashAndStretch.squashAmount,
                scaleX: 1, // Reset from anticipation
                transformOrigin: "bottom center",
                duration: this.animationParams.squashAndStretch.squashDuration,
                ease: "power2.in"
            }, delay / 1000 + 0.15);
        }
        
        // === MAIN REVEAL: Fade in and stretch ===
        this.timeline.to(element, {
            opacity: 1,
            scaleY: this.animationParams.squashAndStretch.enabled ? 
                this.animationParams.squashAndStretch.stretchAmount : 1,
            duration: baseDuration * 0.3,
            ease: "power2.out"
        }, delay / 1000 + 0.25);
        
        // === BUTTERY DRAWING ANIMATION: Left to right reveal ===
        this.timeline.to(revealElement, {
            attr: { width: this.width },
            duration: baseDuration * 0.6,
            ease: "power2.out"
        }, delay / 1000 + 0.3);
        
        // === DISNEY PRINCIPLE 8: SECONDARY ACTION ===
        if (this.animationParams.secondaryAction.enabled && this.animationParams.secondaryAction.jiggleIntensity > 0) {
            for (let i = 0; i < this.animationParams.secondaryAction.maxJiggles; i++) {
                const jiggleTime = delay / 1000 + 0.5 + (i * 0.2);
                const intensity = this.animationParams.secondaryAction.jiggleIntensity;
                
                // Jiggle
                this.timeline.to(element, {
                    x: (Math.random() - 0.5) * intensity,
                    y: (Math.random() - 0.5) * intensity,
                    duration: 0.08,
                    ease: "none"
                }, jiggleTime);
                
                // Return to center
                this.timeline.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.12,
                    ease: "power2.out"
                }, jiggleTime + 0.08);
            }
        }
        
        // === DISNEY PRINCIPLE 5: FOLLOW THROUGH ===
        if (this.animationParams.followThrough.enabled) {
            // Slight overshoot
            this.timeline.to(element, {
                scaleY: this.animationParams.followThrough.overshootAmount,
                duration: 0.1,
                ease: "power2.out"
            }, delay / 1000 + baseDuration - 0.3);
            
            // Settle to final position
            this.timeline.to(element, {
                scaleY: 1,
                duration: this.animationParams.followThrough.settleDuration,
                ease: "back.out(1.5)"
            });
        }
    }
    
    reset() {
        console.log('🔄 Resetting buttery animation...');
        
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Reset all paths and masks
        Object.keys(this.paths).forEach(year => {
            gsap.set(this.paths[year].node(), { 
                opacity: 0, 
                scaleX: 1, 
                scaleY: 1, 
                x: 0, 
                y: 0 
            });
            gsap.set(`.reveal-${year}`, { attr: { width: 0 } });
        });
        
        this.isPlaying = false;
        this.setPlayButtonState(false);
    }
    
    randomizeData() {
        console.log('🎲 Generating new buttery data...');
        
        // Generate new data with variations
        this.data = this.data.map(d => ({
            day: d.day,
            year1: Math.round(d.year1 * (0.8 + Math.random() * 0.4)),
            year2: Math.round(d.year2 * (0.8 + Math.random() * 0.4)),
            year3: Math.round(d.year3 * (0.8 + Math.random() * 0.4))
        }));
        
        // Clear cache and rebuild
        if (typeof DataUtils !== 'undefined' && DataUtils.clearCache) {
            DataUtils.clearCache();
        }
        this.setupChart();
    }
    
    setPlayButtonState(disabled) {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.disabled = disabled;
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ButteryAnimationEngine };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ButteryAnimationEngine };
}