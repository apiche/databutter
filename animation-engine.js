// databutter - Organic Flow Animation Engine
// Living, breathing chart animations with realistic fluid physics

class ButteryAnimationEngine {
    constructor(data, svgSelector, params = {}) {
        // Simplified animation parameters
        this.animationParams = {
            animationSpeed: 1.0,
            drawingDuration: 2.0
        };
        
        this.data = data;
        this.svg = d3.select(svgSelector);
        this.timeline = null;
        this.isPlaying = false;
        
        // Chart dimensions
        this.margin = { top: 20, right: 30, bottom: 40, left: 60 };
        this.width = 1000 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        
        // Organic flow properties
        this.originalPoints = [];
        this.noiseOffset = 0;
        this.breathingOffset = 0;
        this.drawProgress = 0;
        
        this.setupChart();
        
        console.log('🌊 Organic Flow Animation Engine ready');
    }
    
    setupChart() {
        console.log('🌊 Setting up progressive drawing chart...');
        
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
        
        // Create progressive area generator
        this.areaGenerator = d3.area()
            .x(d => this.xScale(d.day))
            .y0(this.height)
            .y1(d => this.yScale(d.year1))
            .curve(d3.curveCardinal.tension(0.3));
        
        // Store original points for morphing
        this.storeOriginalPoints();
        
        // Create the organic area path (starts empty)
        this.organicPath = this.chartGroup
            .append("path")
            .attr("class", "area-path year-1 organic-flow")
            .style("fill", "#e74c3c")
            .style("stroke", "#c0392b")
            .style("stroke-width", "2px")
            .style("fill-opacity", 0.7);
        
        // Initialize with empty data
        this.currentDataSlice = [];
        
        console.log('✨ Progressive drawing chart ready');
    }
    
    storeOriginalPoints() {
        // Store the original data points for morphing
        this.originalPoints = this.data.map(d => ({
            x: this.xScale(d.day),
            y: this.yScale(d.year1),
            originalY: this.yScale(d.year1)
        }));
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
    
    playOrganicFlow() {
        if (this.isPlaying) {
            console.log('🌊 Animation already playing');
            return;
        }
        
        console.log(`🌊 Starting realistic fluid momentum animation`);
        this.isPlaying = true;
        this.setPlayButtonState(true);
        
        // Kill existing timeline
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Create flow timeline
        this.timeline = gsap.timeline({
            onComplete: () => {
                console.log('✨ Realistic fluid animation complete');
                this.isPlaying = false;
                this.setPlayButtonState(false);
            }
        });
        
        // Single animation style with micro-organic life + realistic jello
        this.animateRealisticFluid();
    }
    
    animateRealisticFluid() {
        console.log('🌊 Starting progressive drawing animation...');
        const speed = this.animationParams.animationSpeed;
        const drawDuration = this.animationParams.drawingDuration / speed;
        
        // Calculate timing for each segment
        const totalSegments = this.data.length;
        const segmentDuration = drawDuration / totalSegments;
        
        console.log(`📊 Drawing ${totalSegments} segments over ${drawDuration}s (${segmentDuration}s per segment)`);
        
        // Store reference to this for use in callbacks
        const self = this;
        
        // Progressive drawing with explicit function binding
        for (let i = 0; i < totalSegments; i++) {
            const segmentDelay = i * segmentDuration;
            
            // Use explicit function with bound context
            this.timeline.call(function() {
                self.addDataSegment(i);
            }, segmentDelay);
        }
        
        // Clunk after drawing completes
        this.timeline.call(function() {
            console.log('🍮 Drawing complete - starting clunk');
            self.jelloSettle();
        }, drawDuration + 0.1);
        
        // Micro-life after clunk
        this.timeline.to(this.organicPath.node(), {
            y: 1,
            duration: 1.0 / speed,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 3
        }, drawDuration + 0.3);
        
        // Return to accurate data
        this.timeline.call(function() {
            self.returnToAccurateData();
        });
    }
    
    // === PROGRESSIVE SEGMENT ADDITION ===
    addDataSegment(segmentIndex) {
        console.log(`📈 Adding segment ${segmentIndex + 1}/${this.data.length}`);
        
        // Add the next data point to our current slice
        this.currentDataSlice = this.data.slice(0, segmentIndex + 1);
        
        // Future: This is where we'll add leading edge morphing based on acceleration
        // For now, just draw the segment normally
        this.updateProgressivePath();
    }
    
    // === UPDATE PATH WITH CURRENT DATA SLICE ===
    updateProgressivePath() {
        // Update the path with current data slice
        this.organicPath
            .datum(this.currentDataSlice)
            .attr("d", this.areaGenerator);
    }
    
    // === SINGLE MICRO-LIFE FUNCTION (simplified) ===
    updateMicroLife() {
        this.breathingOffset += 0.02;
        const morphedPoints = this.originalPoints.map((point, i) => {
            // MICRO movement: max 1 pixel - barely perceptible life
            const microLife = Math.sin(this.breathingOffset + i * 0.3) * 1.0;
            return {
                ...point,
                y: point.originalY + microLife
            };
        });
        this.updatePathWithPoints(morphedPoints);
    }
    
    // === INTEGRATED CLUNK: Manual sequencing to avoid callback errors ===
    jelloSettle() {
        console.log('🍮 Buttery integrated clunk starting...');
        
        // Pre-calculate momentum data once
        const momentumData = this.originalPoints.map((point, i) => {
            const dataHeight = this.data[i].year1;
            return {
                liquidMass: dataHeight / DataUtils.getMaxValue()
            };
        });
        
        // Manual sequence without problematic callbacks
        setTimeout(() => {
            console.log('🍮 Phase 1: Overshoot');
            this.morphVerticalBoundary(momentumData, 'overshoot');
        }, 0);
        
        setTimeout(() => {
            console.log('🍮 Phase 2: Clunk down');
            this.morphVerticalBoundary(momentumData, 'clunk');
        }, 30); // 0.03s = 30ms
        
        setTimeout(() => {
            console.log('🍮 Phase 3: Bounce');
            this.morphVerticalBoundary(momentumData, 'bounce');
        }, 90); // 0.03 + 0.06 = 90ms
        
        setTimeout(() => {
            console.log('🍮 Phase 4: Lock');
            this.morphVerticalBoundary(momentumData, 'lock');
        }, 130); // 0.03 + 0.06 + 0.04 = 130ms
        
        setTimeout(() => {
            console.log('🍮 Buttery clunk complete!');
            this.returnToAccurateData();
        }, 150); // 0.03 + 0.06 + 0.04 + 0.02 = 150ms
    }
    
    // === MORPH VERTICAL BOUNDARY FOR SATISFYING CLUNK ===
    morphVerticalBoundary(momentumData, phase) {
        let displacement = 0;
        
        switch (phase) {
            case 'overshoot':
                displacement = -8; // Overshoot UP (negative = higher)
                break;
            case 'clunk':
                displacement = 6; // Satisfying drop DOWN (positive = lower)
                break;
            case 'bounce':
                displacement = -2; // Small bounce UP
                break;
            case 'lock':
                displacement = 0; // Final lock into accurate position
                break;
        }
        
        // Create new data with Y-shifted values for satisfying vertical movement
        const morphedData = this.data.map((d, i) => {
            const momentum = momentumData[i];
            // Higher data points have more "weight" so they clunk more
            const verticalShift = displacement * momentum.liquidMass;
            
            // Calculate the shifted Y value
            const currentY = this.yScale(d.year1);
            const shiftedY = currentY + verticalShift;
            const shiftedValue = this.yScale.invert(shiftedY);
            
            return {
                day: d.day, // Keep X accurate
                year1: Math.max(shiftedValue, 0) // Don't go negative, clamp to bottom
            };
        });
        
        // Update path - vertical clunk movement
        this.organicPath
            .datum(morphedData)
            .attr("d", this.areaGenerator);
    }
    
    // === MORPH VERTICAL BOUNDARY FOR BUTTERY CLUNK ===
    morphVerticalBoundary(momentumData, phase) {
        let displacement = 0;
        
        switch (phase) {
            case 'overshoot':
                displacement = -8; // Up (negative = higher on chart)
                break;
            case 'clunk':
                displacement = 6; // Down (positive = lower on chart)
                break;
            case 'bounce':
                displacement = -2; // Small up
                break;
            case 'lock':
                displacement = 0; // Final accurate position
                break;
        }
        
        // Create morphed data with Y-shifted values
        const morphedData = this.data.map((d, i) => {
            const momentum = momentumData[i];
            // Higher data points have more "weight" so they move more
            const verticalShift = displacement * momentum.liquidMass;
            
            // Calculate the shifted Y value
            const currentY = this.yScale(d.year1);
            const shiftedY = currentY + verticalShift;
            const shiftedValue = this.yScale.invert(shiftedY);
            
            return {
                day: d.day, // Keep X accurate
                year1: Math.max(shiftedValue, 0) // Don't go negative
            };
        });
        
        // Update path with buttery morphing
        this.organicPath
            .datum(morphedData)
            .attr("d", this.areaGenerator);
    }
    
    updatePathWithPoints(points) {
        // Create new data array with morphed points
        const morphedData = points.map((point, i) => ({
            day: this.data[i].day,
            year1: this.yScale.invert(point.y)
        }));
        
        // Update the path
        this.organicPath
            .datum(morphedData)
            .attr("d", this.areaGenerator);
    }
    
    // === RETURN TO ACCURATE DATA ===
    returnToAccurateData() {
        console.log('📊 Returning to accurate complete dataset');
        
        // Reset to the full, accurate dataset
        this.organicPath
            .datum(this.data)
            .attr("d", this.areaGenerator);
        
        // Reset current slice to full data
        this.currentDataSlice = this.data;
        
        // Reset offsets
        this.noiseOffset = 0;
        this.breathingOffset = 0;
    }
    
    reset() {
        console.log('🔄 Resetting progressive drawing...');
        
        if (this.timeline) {
            this.timeline.kill();
        }
        
        // Reset current data slice
        this.currentDataSlice = [];
        
        // Clear the path
        this.organicPath.datum([]).attr("d", this.areaGenerator);
        
        // Reset offsets
        this.noiseOffset = 0;
        this.breathingOffset = 0;
        this.drawProgress = 0;
        
        this.isPlaying = false;
        this.setPlayButtonState(false);
    }
    
    randomizeData() {
        console.log('🎲 Generating new organic data...');
        
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
    
    // Legacy methods for compatibility
    play() {
        this.playOrganicFlow();
    }
    
    playSelectedYears(years) {
        this.playOrganicFlow();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ButteryAnimationEngine };
}