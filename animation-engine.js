addSettleEffect() {
        console.log('🍮 Adding GSAP settle effects after data-aware reveal');
        
        const settleTimeline = gsap.timeline();
        
        // Subtle vertical settle
        settleTimeline.to(this.mainPath.node(), {
            y: -2,
            duration: 0.08,
            ease: "power2.out"
        });
        
        settleTimeline.to(this.mainPath.node(), {
            y: 1,
            duration: 0.12,
            ease: "bounce.out"
        });
        
        settleTimeline.to(this.mainPath.node(), {
            y: 0,
            duration: 0.08,
            ease: "power2.inOut"
        });
        
        // Gentle breathing
        settleTimeline.to(this.mainPath.node(), {
            scaleY: 1.002,
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 2,
            transformOrigin: "center bottom"
        });
    }
    
    // Enhanced GSAP animation control methods
    pause() {
        if (this.timeline) {
            this.timeline.pause();
        }
    }
    
    resume() {
        if (this.timeline) {
            this.timeline.resume();
        }
    }
    
    // Jump to specific progress (great for scrubbing!)
    seekToProgress(progress) {
        if (this.timeline) {
            this.timeline.progress(progress);
        }
    }// databutter - Data-Aware Clipping Animation Engine
// GPU-accelerated clipping with Y-aware leading edge shaping

class ButteryAnimationEngine {
    constructor(data, svgSelector, params = {}) {
        this.animationParams = {
            animationSpeed: 1.0,
            drawingDuration: 2.0,
            leadingEdgeBulge: 0.15, // How much the leading edge bulges (15% of data height)
            curveSmoothing: 8 // How many pixels ahead to look for curve preview
        };
        
        // Focus on year 1 only for now
        this.rawData = data.map(d => ({
            day: d.day,
            value: d.year1
        }));
        
        this.svg = d3.select(svgSelector);
        this.timeline = null;
        this.isPlaying = false;
        
        // Chart dimensions
        this.margin = { top: 20, right: 30, bottom: 40, left: 60 };
        this.width = 1000 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        
        // Data-aware clipping state
        this.curveLookup = null; // Pre-computed Y values for every X pixel
        this.clipPath = null;
        this.clipRect = null;
        this.currentClipX = 0;
        
        this.setupChart();
        
        console.log('🎨 Data-Aware Clipping Engine ready - Y-responsive leading edge');
    }
    
    setupChart() {
        console.log('📊 Setting up data-aware clipping chart...');
        
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
            .domain(d3.extent(this.rawData, d => d.day))
            .range([0, this.width]);
        
        const maxValue = d3.max(this.rawData, d => d.value);
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
            .curve(d3.curveMonotoneX); // D3's smooth interpolation
        
        // Generate the complete area path (D3 does the heavy lifting ONCE)
        const fullPathData = this.areaGenerator(this.rawData);
        
        // Create the main path (fully drawn but clipped)
        this.mainPath = this.chartGroup
            .append("path")
            .attr("class", "area-path year-1")
            .style("fill", "#e74c3c")
            .style("stroke", "#c0392b")
            .style("stroke-width", "2px")
            .style("fill-opacity", 0.7)
            .attr("d", fullPathData); // Full path is ready immediately
        
        // CORE INNOVATION: Pre-compute curve lookup table
        this.generateCurveLookup();
        
        // Set up clipping system
        this.setupDataAwareClipping();
        
        console.log('✨ Chart ready with data-aware clipping system');
    }
    
    addAxes() {
        // X-axis
        this.chartGroup.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale)
                .ticks(Math.min(this.rawData.length, 15))
                .tickFormat(d => `Day ${d}`)
            );
        
        // Y-axis  
        this.chartGroup.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(this.yScale)
                .tickFormat(d3.format(".2s"))
            );
    }
    
    // CORE INNOVATION: Generate dense curve lookup table
    generateCurveLookup() {
        console.log('🔍 Pre-computing curve lookup table...');
        
        this.curveLookup = [];
        
        // Sample Y values at every pixel across the chart width
        for (let pixelX = 0; pixelX <= this.width; pixelX++) {
            // Convert pixel X back to data domain
            const dataX = this.xScale.invert(pixelX);
            
            // Interpolate Y value at this X position
            const dataY = this.interpolateYAtX(dataX);
            
            // Convert back to pixel coordinates
            const pixelY = this.yScale(dataY);
            
            this.curveLookup[pixelX] = {
                dataX: dataX,
                dataY: dataY,
                pixelY: pixelY
            };
        }
        
        console.log(`✨ Generated lookup table for ${this.curveLookup.length} pixels`);
    }
    
    // Interpolate Y value at any X position using our raw data
    interpolateYAtX(targetX) {
        // Find the two data points that bracket our target X
        let lowerIndex = -1;
        let upperIndex = -1;
        
        for (let i = 0; i < this.rawData.length - 1; i++) {
            if (this.rawData[i].day <= targetX && this.rawData[i + 1].day >= targetX) {
                lowerIndex = i;
                upperIndex = i + 1;
                break;
            }
        }
        
        // Handle edge cases
        if (lowerIndex === -1) {
            if (targetX <= this.rawData[0].day) return this.rawData[0].value;
            if (targetX >= this.rawData[this.rawData.length - 1].day) return this.rawData[this.rawData.length - 1].value;
        }
        
        // Linear interpolation between the two points
        const lowerPoint = this.rawData[lowerIndex];
        const upperPoint = this.rawData[upperIndex];
        const fraction = (targetX - lowerPoint.day) / (upperPoint.day - lowerPoint.day);
        
        return lowerPoint.value + (upperPoint.value - lowerPoint.value) * fraction;
    }
    
    // Set up the data-aware clipping system
    setupDataAwareClipping() {
        console.log('✂️ Setting up data-aware clipping...');
        
        // Create clip path definition
        const clipId = "data-aware-clip-" + Date.now();
        const defs = this.chartGroup.append("defs");
        
        this.clipPath = defs.append("clipPath")
            .attr("id", clipId);
        
        // Start with an empty clip path
        this.clipPathElement = this.clipPath.append("path")
            .attr("d", "M0,0 L0,0 L0,0 Z"); // Empty path
        
        // Apply clipping to the main path
        this.mainPath.attr("clip-path", `url(#${clipId})`);
        
        // Reset clip position
        this.currentClipX = 0;
        
        console.log('✨ Data-aware clipping system ready');
    }
    
    // Generate data-aware clip path with leading edge shaping
    generateDataAwareClipPath(currentX) {
        if (currentX <= 0) {
            return "M0,0 L0,0 L0,0 Z"; // Empty
        }
        
        if (currentX >= this.width) {
            // Full reveal - simple rectangle
            return `M0,0 L${this.width},0 L${this.width},${this.height} L0,${this.height} Z`;
        }
        
        // Get current data info
        const currentData = this.curveLookup[Math.floor(currentX)] || { pixelY: this.height / 2 };
        
        // Look ahead a few pixels to preview the curve direction
        const lookAheadX = Math.min(currentX + this.animationParams.curveSmoothing, this.width - 1);
        const lookAheadData = this.curveLookup[Math.floor(lookAheadX)] || currentData;
        
        // Calculate leading edge bulge based on data height and direction
        const dataHeight = this.height - currentData.pixelY; // Height from bottom
        const dataHeightRatio = dataHeight / this.height; // 0 to 1
        const bulgeAmount = dataHeightRatio * this.animationParams.leadingEdgeBulge * 30; // Convert to pixels
        
        // Calculate curve direction (is data going up or down?)
        const curveDirection = lookAheadData.pixelY - currentData.pixelY;
        const directionBias = Math.sign(curveDirection) * 0.3; // Slight bias in curve direction
        
        // Create organic leading edge shape
        const edgeControlX = currentX + bulgeAmount + 10; // How far the bulge extends
        const edgeControlY1 = Math.max(0, currentData.pixelY - bulgeAmount + directionBias * 10);
        const edgeControlY2 = Math.min(this.height, currentData.pixelY + bulgeAmount + directionBias * 5);
        
        // Generate smooth clip path with data-aware leading edge
        const clipPath = `
            M0,0 
            L${currentX},0
            Q${edgeControlX},${edgeControlY1} ${currentX},${currentData.pixelY}
            Q${edgeControlX},${edgeControlY2} ${currentX},${this.height}
            L0,${this.height} 
            Z
        `.replace(/\s+/g, ' ').trim();
        
        return clipPath;
    }
    
    play() {
        if (this.isPlaying) {
            console.log('⚠️ Animation already playing');
            return;
        }
        
        console.log('🎬 Starting GSAP-powered data-aware clipping');
        this.isPlaying = true;
        this.setPlayButtonState(true);
        
        // Kill existing timeline
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Create GSAP timeline for the clipping animation
        this.timeline = gsap.timeline({
            onComplete: () => {
                console.log('✨ GSAP clipping animation complete');
                this.isPlaying = false;
                this.setPlayButtonState(false);
                this.addSettleEffect();
            }
        });
        
        // Start GSAP-powered clipping animation
        this.startGSAPClippingAnimation();
    }
    
    startGSAPClippingAnimation() {
        const speed = this.animationParams.animationSpeed;
        const duration = this.animationParams.drawingDuration / speed;
        
        console.log(`✂️ GSAP data-aware clipping over ${duration}s at ${speed}x speed`);
        
        // Reset clipping state
        this.currentClipX = 0;
        
        // GSAP animates a progress value from 0 to 1
        // We use onUpdate to generate the clip path at each frame
        this.timeline.to({ progress: 0 }, {
            progress: 1,
            duration: duration,
            ease: "power2.inOut", // Much easier easing control with GSAP!
            onUpdate: () => {
                // Get current progress and convert to X position
                const progress = this.timeline.progress();
                this.currentClipX = progress * this.width;
                
                // Generate and apply data-aware clip path
                const clipPathData = this.generateDataAwareClipPath(this.currentClipX);
                this.clipPathElement.attr("d", clipPathData);
                
                // Add leading edge effects
                this.updateLeadingEdgeEffects(progress);
            }
        });
    }
    
    updateLeadingEdgeEffects(progress) {
        // Subtle stroke width pulse at leading edge using GSAP timing
        const basePulse = 1 + Math.sin(Date.now() * 0.008) * 0.2;
        const progressPulse = Math.sin(progress * Math.PI) * 0.3;
        const strokeWidth = 2 + (basePulse + progressPulse);
        
        this.mainPath.style("stroke-width", `${strokeWidth}px`);
    }
    
    reset() {
        console.log('🔄 Resetting GSAP data-aware clipping...');
        
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Reset clip to empty
        if (this.clipPathElement) {
            this.clipPathElement.attr("d", "M0,0 L0,0 L0,0 Z");
        }
        
        // Reset main path transforms
        this.mainPath
            .attr("transform", null)
            .style("stroke-width", "2px");
        
        this.currentClipX = 0;
        this.isPlaying = false;
        this.setPlayButtonState(false);
    }
    
    randomizeData() {
        console.log('🎲 Generating new data for data-aware clipping...');
        
        // Generate new data
        this.rawData = sampleData.map(d => ({
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
    
    // Diagnostic method to visualize curve lookup
    debugCurveLookup() {
        console.log('🔬 Curve lookup sample:', this.curveLookup.slice(0, 10));
        
        // Optional: Add visual debugging
        this.curveLookup.forEach((point, x) => {
            if (x % 20 === 0) { // Every 20 pixels
                this.chartGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", point.pixelY)
                    .attr("r", 1)
                    .style("fill", "yellow")
                    .style("opacity", 0.5);
            }
        });
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ButteryAnimationEngine };
}