// databutter - Progressive Drawing Animation Engine
// True progressive path drawing with 60fps performance

class ButteryAnimationEngine {
    constructor(data, svgSelector, params = {}) {
        this.animationParams = {
            animationSpeed: 1.0,
            drawingDuration: 2.0
        };
        
        // Focus on year 1 only for now
        this.data = data.map(d => ({
            day: d.day,
            value: d.year1  // Single year focus
        }));
        
        this.svg = d3.select(svgSelector);
        this.timeline = null;
        this.isPlaying = false;
        
        // Chart dimensions
        this.margin = { top: 20, right: 30, bottom: 40, left: 60 };
        this.width = 1000 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        
        this.setupChart();
        
        console.log('🎨 Progressive Drawing Engine ready - Year 1 only');
    }
    
    setupChart() {
        console.log('📊 Setting up progressive drawing chart...');
        
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
        
        // Get max value for year 1 only
        const maxValue = d3.max(this.data, d => d.value);
        this.yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([this.height, 0]);
        
        // Add axes
        this.addAxes();
        
        // Create area generator with smooth curve
        this.areaGenerator = d3.area()
            .x(d => this.xScale(d.day))
            .y0(this.height)
            .y1(d => this.yScale(d.value))
            .curve(d3.curveMonotoneX); // Smooth but not too bouncy
        
        // Create the main path (starts empty)
        this.mainPath = this.chartGroup
            .append("path")
            .attr("class", "area-path year-1")
            .style("fill", "#e74c3c")
            .style("stroke", "#c0392b")
            .style("stroke-width", "2px")
            .style("fill-opacity", 0.7);
        
        // Generate the full path string for measurement
        this.fullPathData = this.areaGenerator(this.data);
        
        // Set up for progressive drawing
        this.mainPath
            .attr("d", this.fullPathData)
            .style("opacity", 0); // Start invisible
        
        console.log('✨ Chart ready for progressive drawing');
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
        if (this.isPlaying) {
            console.log('⚠️ Animation already playing');
            return;
        }
        
        console.log('🎬 Starting progressive drawing animation');
        this.isPlaying = true;
        this.setPlayButtonState(true);
        
        // Kill existing timeline
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Create new timeline
        this.timeline = gsap.timeline({
            onComplete: () => {
                console.log('✨ Animation complete');
                this.isPlaying = false;
                this.setPlayButtonState(false);
                this.addSettleEffect();
            }
        });
        
        // Progressive drawing using clip-path for TRUE drawing effect
        this.animateProgressiveDraw();
    }
    
    animateProgressiveDraw() {
        const speed = this.animationParams.animationSpeed;
        const duration = this.animationParams.drawingDuration / speed;
        
        console.log(`🎨 Drawing over ${duration}s at ${speed}x speed`);
        
        // Create a clip path for progressive reveal
        const clipId = "clip-" + Date.now();
        const defs = this.chartGroup.append("defs");
        
        const clipPath = defs.append("clipPath")
            .attr("id", clipId);
        
        const clipRect = clipPath.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0) // Start with 0 width
            .attr("height", this.height);
        
        // Apply clip path to the main path
        this.mainPath
            .style("opacity", 1)
            .attr("clip-path", `url(#${clipId})`);
        
        // Animate the clip rectangle width for progressive reveal
        // This is GPU-accelerated and maintains 60fps
        this.timeline.to(clipRect.node(), {
            attr: { width: this.width },
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                // Optional: Add leading edge effects here
                const progress = this.timeline.progress();
                this.updateLeadingEdge(progress);
            }
        });
        
        // Add a subtle morph as it draws
        this.timeline.to(this.mainPath.node(), {
            attr: { 
                "stroke-width": 3 
            },
            duration: duration * 0.3,
            ease: "power2.out"
        }, 0);
        
        this.timeline.to(this.mainPath.node(), {
            attr: { 
                "stroke-width": 2 
            },
            duration: duration * 0.3,
            ease: "power2.in"
        }, duration * 0.7);
    }
    
    updateLeadingEdge(progress) {
        // Add subtle leading edge effects without killing performance
        // This runs on every frame so must be very light
        
        if (progress < 0.98) { // Don't apply at the very end
            // Could add a subtle glow or bulge at the leading edge
            // For now, keeping it simple for 60fps
        }
    }
    
    addSettleEffect() {
        console.log('🍮 Adding settle effect');
        
        // Create a subtle jello settle at the end
        const settleTimeline = gsap.timeline();
        
        // Subtle vertical bounce
        settleTimeline.to(this.mainPath.node(), {
            y: -5,
            duration: 0.1,
            ease: "power2.out"
        });
        
        settleTimeline.to(this.mainPath.node(), {
            y: 3,
            duration: 0.15,
            ease: "bounce.out"
        });
        
        settleTimeline.to(this.mainPath.node(), {
            y: 0,
            duration: 0.1,
            ease: "power2.inOut"
        });
        
        // Add a subtle breathing effect after settle
        settleTimeline.to(this.mainPath.node(), {
            scaleY: 1.01,
            duration: 1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 2,
            transformOrigin: "center bottom"
        });
    }
    
    reset() {
        console.log('🔄 Resetting animation...');
        
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Reset the path
        this.mainPath
            .style("opacity", 0)
            .attr("clip-path", null)
            .attr("transform", null)
            .attr("y", null)
            .style("stroke-width", "2px");
        
        // Remove any clip paths
        this.chartGroup.selectAll("defs").remove();
        
        this.isPlaying = false;
        this.setPlayButtonState(false);
    }
    
    randomizeData() {
        console.log('🎲 Generating new data...');
        
        // Generate new data for year 1 only
        this.data = sampleData.map(d => ({
            day: d.day,
            value: Math.round(d.year1 * (0.8 + Math.random() * 0.4))
        }));
        
        this.setupChart();
    }
    
    setPlayButtonState(disabled) {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.disabled = disabled;
        }
    }
    
    // For backwards compatibility
    playOrganicFlow() {
        this.play();
    }
    
    playSelectedYears(years) {
        // For now, always play year 1
        this.play();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ButteryAnimationEngine };
}