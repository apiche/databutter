// databutter - Enhanced Data Management
// Story-driven data with performance optimizations

const sampleData = [
    { day: 1, year1: 2150, year2: 6800, year3: 8900 },
    { day: 2, year1: 2380, year2: 7200, year3: 9200 },
    { day: 3, year1: 2890, year2: 7500, year3: 8800 },
    { day: 4, year1: 3200, year2: 7300, year3: 8400 },
    { day: 5, year1: 3450, year2: 7100, year3: 7900 },
    { day: 6, year1: 3800, year2: 6900, year3: 7200 },
    { day: 7, year1: 4100, year2: 6700, year3: 6800 },
    { day: 8, year1: 4600, year2: 6500, year3: 6400 },
    { day: 9, year1: 5200, year2: 6300, year3: 6000 },
    { day: 10, year1: 5800, year2: 6100, year3: 6200 },
    { day: 11, year1: 6400, year2: 5900, year3: 7500 },
    { day: 12, year1: 7100, year2: 5700, year3: 9200 },
    { day: 13, year1: 7800, year2: 5500, year3: 10800 },
    { day: 14, year1: 8200, year2: 5200, year3: 11900 },
    { day: 15, year1: 8500, year2: 4800, year3: 12400 }
];

// Enhanced data story with narrative beats for animation timing
const dataStory = {
    year1: {
        name: "The Slow Burn (2022)",
        description: "Started cautiously with low inventory and limited marketing. Gradual word-of-mouth growth led to strong finish as we figured out our audience.",
        pattern: "Steady upward climb",
        peak: { day: 15, value: 8500 },
        total: 78950,
        personality: "cautious-building",
        animationPersonality: {
            speed: 0.9,         // 10% slower than base
            easing: "power2.out",
            anticipation: 0.95,  // Subtle anticipation
            squash: 0.95        // Gentle squash
        },
        narrativeBeats: [
            { day: 1, moment: "humble-beginning" },
            { day: 5, moment: "finding-traction" },
            { day: 10, moment: "momentum-building" },
            { day: 15, moment: "first-success" }
        ]
    },
    
    year2: {
        name: "The Plateau Peak (2023)", 
        description: "Strong start with improved marketing, steady middle performance, but supply chain issues prevented explosive growth in final days.",
        pattern: "High start, gradual decline",
        peak: { day: 3, value: 7500 },
        total: 95100,
        personality: "confident-decline",
        animationPersonality: {
            speed: 1.0,         // Normal speed
            easing: "power3.inOut",
            anticipation: 0.92, // More pronounced anticipation
            squash: 0.9         // Moderate squash
        },
        narrativeBeats: [
            { day: 1, moment: "confident-launch" },
            { day: 3, moment: "early-peak" },
            { day: 8, moment: "plateau-concern" },
            { day: 15, moment: "supply-troubles" }
        ]
    },
    
    year3: {
        name: "The Rollercoaster Victory (2024)",
        description: "Launched big with influencer partnerships, hit a mid-cycle lull, then absolutely crushed it with our best finale ever thanks to viral TikTok moment.",
        pattern: "High start, dip, explosive finish",
        peak: { day: 15, value: 12400 },
        total: 121500,
        personality: "dramatic-victory",
        animationPersonality: {
            speed: 1.2,         // 20% faster than base
            easing: "back.out(1.7)",
            anticipation: 0.88, // Strong anticipation
            squash: 0.85        // Dramatic squash
        },
        narrativeBeats: [
            { day: 1, moment: "influencer-launch" },
            { day: 9, moment: "mid-cycle-dip" },
            { day: 11, moment: "comeback-begins" },
            { day: 13, moment: "viral-moment" },
            { day: 15, moment: "victory-finale" }
        ]
    }
};

// Enhanced data utilities with performance optimizations
const DataUtils = {
    // Cached calculations for performance
    _cache: new Map(),
    
    // Get max value across all years (cached)
    getMaxValue() {
        const cacheKey = 'maxValue';
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const maxValue = d3.max(sampleData, d => Math.max(d.year1, d.year2, d.year3));
        this._cache.set(cacheKey, maxValue);
        return maxValue;
    },
    
    // Get data for specific year (cached)
    getYearData(year) {
        const cacheKey = `yearData-${year}`;
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const yearKey = `year${year}`;
        const yearData = sampleData.map(d => ({
            day: d.day,
            value: d[yearKey]
        }));
        
        this._cache.set(cacheKey, yearData);
        return yearData;
    },
    
    // Get totals for each year (cached)
    getYearTotals() {
        const cacheKey = 'yearTotals';
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const totals = {
            year1: d3.sum(sampleData, d => d.year1),
            year2: d3.sum(sampleData, d => d.year2),
            year3: d3.sum(sampleData, d => d.year3)
        };
        
        this._cache.set(cacheKey, totals);
        return totals;
    },
    
    // Find peak day for each year (cached)
    getPeakDays() {
        const cacheKey = 'peakDays';
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        let peaks = { year1: null, year2: null, year3: null };
        
        sampleData.forEach(d => {
            ['year1', 'year2', 'year3'].forEach(year => {
                if (!peaks[year] || d[year] > peaks[year].value) {
                    peaks[year] = { day: d.day, value: d[year] };
                }
            });
        });
        
        this._cache.set(cacheKey, peaks);
        return peaks;
    },
    
    // Get animation personality for a year
    getYearPersonality(yearNumber) {
        const yearKey = `year${yearNumber}`;
        return dataStory[yearKey]?.animationPersonality || {
            speed: 1.0,
            easing: "power2.out",
            anticipation: 0.95,
            squash: 0.9
        };
    },
    
    // Get narrative beats for dramatic timing
    getNarrativeBeats(yearNumber) {
        const yearKey = `year${yearNumber}`;
        return dataStory[yearKey]?.narrativeBeats || [];
    },
    
    // Check if a day is a dramatic moment
    isDramaticMoment(yearNumber, day) {
        const beats = this.getNarrativeBeats(yearNumber);
        return beats.some(beat => beat.day === day && 
            ['viral-moment', 'victory-finale', 'first-success'].includes(beat.moment));
    },
    
    // Get data intensity for adaptive timing
    getDataIntensity(yearNumber) {
        const yearData = this.getYearData(yearNumber);
        const values = yearData.map(d => d.value);
        const range = Math.max(...values) - Math.min(...values);
        const maxPossibleRange = this.getMaxValue();
        
        // Return intensity score 0-1
        return Math.min(range / maxPossibleRange, 1);
    },
    
    // Generate variation for organic feel
    generateOrganicVariation(baseValue, variationPercent = 0.1) {
        const variation = (Math.random() - 0.5) * variationPercent;
        return baseValue * (1 + variation);
    },
    
    // Clear cache when data changes
    clearCache() {
        this._cache.clear();
    },
    
    // Get summary statistics
    getSummaryStats() {
        return {
            totalSales: Object.values(this.getYearTotals()).reduce((sum, year) => sum + year, 0),
            bestYear: this.getBestYear(),
            bestDay: this.getBestSingleDay(),
            growthRate: this.getGrowthRate(),
            averageDailySales: this.getAverageDailySales()
        };
    },
    
    getBestYear() {
        const totals = this.getYearTotals();
        return Object.keys(totals).reduce((best, year) => 
            totals[year] > totals[best] ? year : best
        );
    },
    
    getBestSingleDay() {
        let bestDay = { year: null, day: null, value: 0 };
        
        sampleData.forEach(d => {
            ['year1', 'year2', 'year3'].forEach((year, index) => {
                if (d[year] > bestDay.value) {
                    bestDay = {
                        year: index + 1,
                        day: d.day,
                        value: d[year]
                    };
                }
            });
        });
        
        return bestDay;
    },
    
    getGrowthRate() {
        const totals = this.getYearTotals();
        return Math.round(((totals.year3 - totals.year1) / totals.year1) * 100);
    },
    
    getAverageDailySales() {
        const totals = this.getYearTotals();
        const totalSales = Object.values(totals).reduce((sum, year) => sum + year, 0);
        return Math.round(totalSales / (15 * 3)); // 15 days * 3 years
    }
};

// Animation Presets (formerly "D" presets)
const AnimationPresets = {
    "subtle-professional": {
        name: "Subtle Professional",
        description: "Conservative animations suitable for board presentations",
        squashAndStretch: { 
            enabled: true,
            squashAmount: 0.95, 
            stretchAmount: 1.05,
            squashDuration: 0.2,
            stretchDuration: 0.25
        },
        anticipation: { 
            enabled: true,
            pullbackAmount: 0.98,
            pauseDuration: 0.03
        },
        followThrough: {
            enabled: true,
            overshootAmount: 1.02,
            settleDuration: 0.3
        },
        timing: { 
            baseDuration: 2000,
            staggerDelay: 400,
            organicVariation: 0.1,
            accelerando: false,
            dramaticPauses: false
        },
        secondaryAction: {
            enabled: false
        },
        easing: {
            mainActionEase: "power2.out"
        }
    },
    
    "dramatic-presentation": {
        name: "Dramatic Presentation",
        description: "Eye-catching animations for impressive demos",
        squashAndStretch: { 
            enabled: true,
            squashAmount: 0.85, 
            stretchAmount: 1.2,
            squashDuration: 0.15,
            stretchDuration: 0.2
        },
        anticipation: { 
            enabled: true,
            pullbackAmount: 0.9,
            pauseDuration: 0.08
        },
        followThrough: {
            enabled: true,
            overshootAmount: 1.08,
            settleDuration: 0.25
        },
        timing: { 
            baseDuration: 1800,
            staggerDelay: 300,
            organicVariation: 0.3,
            accelerando: true,
            dramaticPauses: true
        },
        secondaryAction: {
            enabled: true,
            jiggleIntensity: 1.5,
            microVariations: true
        },
        easing: {
            mainActionEase: "back.out(1.7)"
        }
    },
    
    "hyper-addictive": {
        name: "Hyper Addictive",
        description: "Maximum animation magic for irresistible replay value",
        squashAndStretch: { 
            enabled: true,
            squashAmount: 0.8, 
            stretchAmount: 1.25,
            squashDuration: 0.12,
            stretchDuration: 0.18
        },
        anticipation: { 
            enabled: true,
            pullbackAmount: 0.85,
            pauseDuration: 0.1
        },
        followThrough: {
            enabled: true,
            overshootAmount: 1.1,
            settleDuration: 0.2
        },
        timing: { 
            baseDuration: 1400,
            staggerDelay: 200,
            organicVariation: 0.4,
            accelerando: true,
            dramaticPauses: true
        },
        secondaryAction: {
            enabled: true,
            jiggleIntensity: 2,
            microVariations: true,
            breathingEffect: true
        },
        easing: {
            mainActionEase: "elastic.out(1, 0.5)",
            adaptiveEasing: true
        }
    }
};

// Data generation utilities for experimentation
const DataGenerator = {
    // Generate new sample data with story patterns
    generateStoryData(storyType = 'rollercoaster') {
        const patterns = {
            'slow-burn': {
                // Gradual increase throughout
                generator: (day) => 2000 + (day * 400) + this.addNoise(200)
            },
            'plateau': {
                // High start, plateau, decline
                generator: (day) => {
                    if (day <= 3) return 7000 + this.addNoise(300);
                    if (day <= 10) return 6500 + this.addNoise(200);
                    return 5000 + this.addNoise(400);
                }
            },
            'rollercoaster': {
                // High start, dip, explosive finish
                generator: (day) => {
                    if (day <= 3) return 8500 + this.addNoise(400);
                    if (day <= 10) return 6000 + this.addNoise(300);
                    if (day <= 12) return 7000 + (day - 10) * 800 + this.addNoise(500);
                    return 10000 + (day - 12) * 800 + this.addNoise(600);
                }
            },
            'hockey-stick': {
                // Flat start, exponential growth
                generator: (day) => 3000 + Math.pow(day - 1, 1.8) * 200 + this.addNoise(300)
            }
        };
        
        const pattern = patterns[storyType] || patterns['rollercoaster'];
        
        return Array.from({ length: 15 }, (_, i) => ({
            day: i + 1,
            year1: Math.round(pattern.generator(i + 1) * 0.7), // Year 1 lower
            year2: Math.round(pattern.generator(i + 1) * 0.9), // Year 2 moderate
            year3: Math.round(pattern.generator(i + 1) * 1.0)  // Year 3 full pattern
        }));
    },
    
    addNoise(amount) {
        return (Math.random() - 0.5) * amount;
    },
    
    // Generate data variations for A/B testing animations
    generateVariations(baseData, count = 5) {
        return Array.from({ length: count }, (_, i) => {
            return baseData.map(d => ({
                day: d.day,
                year1: Math.round(d.year1 * (0.8 + Math.random() * 0.4)),
                year2: Math.round(d.year2 * (0.8 + Math.random() * 0.4)),
                year3: Math.round(d.year3 * (0.8 + Math.random() * 0.4))
            }));
        });
    }
};

// Performance tracking for data operations
const DataPerformance = {
    startTime: null,
    
    startTimer(operation) {
        this.startTime = performance.now();
        console.log(`📊 Starting ${operation}...`);
    },
    
    endTimer(operation) {
        if (this.startTime) {
            const duration = performance.now() - this.startTime;
            console.log(`✅ ${operation} completed in ${duration.toFixed(2)}ms`);
            this.startTime = null;
            return duration;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        sampleData, 
        dataStory, 
        DataUtils, 
        AnimationPresets,
        DataGenerator,
        DataPerformance
    };
}