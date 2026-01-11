class Chart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.margin = { top: 20, right: 20, bottom: 40, left: 60 };
        this.chartWidth = this.width - this.margin.left - this.margin.right;
        this.chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        this.series = [
            { data: [], color: '#ff0000', name: 'Series 1' },
            { data: [], color: '#00ff00', name: 'Series 2' },
            { data: [], color: '#0000ff', name: 'Series 3' }
        ];
        
        this.maxDataPoints = 50;
        this.minValue = -50;
        this.maxValue = 50;
        this.showGrid = true;
        this.smooth = false;
        this.chartType = 'line';
        this.theme = 'light';
        
        this.isPlaying = true;
        this.interval = 500;
        this.intervalId = null;
        
        this.tooltip = document.getElementById('tooltip');
        
        this.init();
    }
    
    init() {
        this.resetData();
        this.startAnimation();
        this.setupEventListeners();
    }
    
    resetData() {
        this.series.forEach(series => {
            series.data = [];
            for (let i = 0; i < this.maxDataPoints; i++) {
                series.data.push(this.generateRandomValue());
            }
        });
        this.updateStats();
        this.draw();
    }
    
    generateRandomValue() {
        return Math.random() * (this.maxValue - this.minValue) + this.minValue;
    }
    
    updateData() {
        this.series.forEach(series => {
            series.data.shift();
            series.data.push(this.generateRandomValue());
        });
        this.updateStats();
        this.draw();
    }
    
    updateStats() {
        const allData = this.series.flatMap(s => s.data);
        if (allData.length === 0) return;
        
        const current = allData[allData.length - 1];
        const max = Math.max(...allData);
        const min = Math.min(...allData);
        const avg = allData.reduce((a, b) => a + b, 0) / allData.length;
        
        // Trend: compare last 5 points
        const recent = allData.slice(-5);
        const trend = recent.length > 1 ? (recent[recent.length - 1] - recent[0]) / recent.length : 0;
        
        document.getElementById('current-value').textContent = current.toFixed(2);
        document.getElementById('max-value-stat').textContent = max.toFixed(2);
        document.getElementById('min-value-stat').textContent = min.toFixed(2);
        document.getElementById('avg-value').textContent = avg.toFixed(2);
        document.getElementById('trend-indicator').textContent = trend > 0.1 ? 'Rising' : trend < -0.1 ? 'Falling' : 'Stable';
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawAxes();
        
        this.series.forEach(series => {
            this.drawSeries(series);
        });
    }
    
    drawGrid() {
        if (!this.showGrid) return;
        
        this.ctx.strokeStyle = this.getThemeColor('grid');
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = this.margin.left + (i * this.chartWidth) / 10;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.margin.top);
            this.ctx.lineTo(x, this.height - this.margin.bottom);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = this.margin.top + (i * this.chartHeight) / 5;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left, y);
            this.ctx.lineTo(this.width - this.margin.right, y);
            this.ctx.stroke();
        }
    }
    
    drawAxes() {
        this.ctx.strokeStyle = this.getThemeColor('axis');
        this.ctx.lineWidth = 2;
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.height - this.margin.bottom);
        this.ctx.lineTo(this.width - this.margin.right, this.height - this.margin.bottom);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top);
        this.ctx.lineTo(this.margin.left, this.height - this.margin.bottom);
        this.ctx.stroke();
        
        // Labels
        this.ctx.fillStyle = this.getThemeColor('text');
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        // X labels
        for (let i = 0; i <= 10; i++) {
            const x = this.margin.left + (i * this.chartWidth) / 10;
            const label = Math.round((i * this.maxDataPoints) / 10);
            this.ctx.fillText(label.toString(), x, this.height - this.margin.bottom + 15);
        }
        
        // Y labels
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = this.margin.top + (i * this.chartHeight) / 5;
            const value = this.maxValue - (i * (this.maxValue - this.minValue)) / 5;
            this.ctx.fillText(value.toFixed(0), this.margin.left - 10, y + 4);
        }
    }
    
    drawSeries(series) {
        if (series.data.length < 2) return;
        
        this.ctx.strokeStyle = series.color;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = series.color;
        
        const points = series.data.map((value, index) => ({
            x: this.margin.left + (index * this.chartWidth) / (this.maxDataPoints - 1),
            y: this.margin.top + ((this.maxValue - value) * this.chartHeight) / (this.maxValue - this.minValue)
        }));
        
        if (this.chartType === 'line') {
            this.drawLine(points, series.color);
        } else if (this.chartType === 'bar') {
            this.drawBars(points, series.color);
        } else if (this.chartType === 'area') {
            this.drawArea(points, series.color);
        } else if (this.chartType === 'scatter') {
            this.drawScatter(points, series.color);
        }
    }
    
    drawLine(points, color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        
        if (this.smooth) {
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        } else {
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
        }
        
        this.ctx.stroke();
    }
    
    drawBars(points, color) {
        const barWidth = this.chartWidth / this.maxDataPoints * 0.8;
        points.forEach((point, index) => {
            const barHeight = this.height - this.margin.bottom - point.y;
            this.ctx.fillRect(point.x - barWidth / 2, point.y, barWidth, barHeight);
        });
    }
    
    drawArea(points, color) {
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, this.height - this.margin.bottom);
        points.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.lineTo(points[points.length - 1].x, this.height - this.margin.bottom);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        
        this.drawLine(points, color);
    }
    
    drawScatter(points, color) {
        points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }
    
    getThemeColor(type) {
        const themes = {
            light: { grid: '#ddd', axis: '#000', text: '#000' },
            dark: { grid: '#444', axis: '#fff', text: '#fff' },
            'high-contrast': { grid: '#fff', axis: '#fff', text: '#fff' }
        };
        return themes[this.theme][type];
    }
    
    setTheme(theme) {
        this.theme = theme;
        document.body.className = theme;
        this.draw();
    }
    
    startAnimation() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            if (this.isPlaying) {
                this.updateData();
            }
        }, this.interval);
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.tooltip.style.display = 'none');
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x < this.margin.left || x > this.width - this.margin.right || 
            y < this.margin.top || y > this.height - this.margin.bottom) {
            this.tooltip.style.display = 'none';
            return;
        }
        
        const dataIndex = Math.round(((x - this.margin.left) / this.chartWidth) * (this.maxDataPoints - 1));
        
        if (dataIndex >= 0 && dataIndex < this.maxDataPoints) {
            let tooltipText = `Index: ${dataIndex}<br>`;
            this.series.forEach(series => {
                const value = series.data[dataIndex];
                tooltipText += `${series.name}: ${value.toFixed(2)}<br>`;
            });
            
            this.tooltip.innerHTML = tooltipText;
            this.tooltip.style.left = (e.pageX + 10) + 'px';
            this.tooltip.style.top = (e.pageY - 10) + 'px';
            this.tooltip.style.display = 'block';
        }
    }
    
    exportAsPNG() {
        const link = document.createElement('a');
        link.download = 'chart.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Initialize
const canvas = document.getElementById('chart-canvas');
const chart = new Chart(canvas);

// Controls
document.getElementById('play-pause-btn').addEventListener('click', () => {
    chart.isPlaying = !chart.isPlaying;
    document.getElementById('play-pause-btn').textContent = chart.isPlaying ? 'Pause' : 'Play';
});

document.getElementById('reset-btn').addEventListener('click', () => chart.resetData());

document.getElementById('export-btn').addEventListener('click', () => chart.exportAsPNG());

document.getElementById('interval-slider').addEventListener('input', (e) => {
    chart.interval = parseInt(e.target.value);
    document.getElementById('interval-value').textContent = chart.interval;
    chart.startAnimation();
});

document.getElementById('min-slider').addEventListener('input', (e) => {
    chart.minValue = parseInt(e.target.value);
    document.getElementById('min-value').textContent = chart.minValue;
});

document.getElementById('max-slider').addEventListener('input', (e) => {
    chart.maxValue = parseInt(e.target.value);
    document.getElementById('max-value').textContent = chart.maxValue;
});

document.getElementById('grid-checkbox').addEventListener('change', (e) => {
    chart.showGrid = e.target.checked;
    chart.draw();
});

document.getElementById('smoothing-checkbox').addEventListener('change', (e) => {
    chart.smooth = e.target.checked;
    chart.draw();
});

document.getElementById('chart-type').addEventListener('change', (e) => {
    chart.chartType = e.target.value;
    chart.draw();
});

document.getElementById('theme-select').addEventListener('change', (e) => {
    chart.setTheme(e.target.value);
});