let tooltip = d3.select('#chartTooltip');

//Variables para colores
let one_color = '#00827E';
let more_colors_first = '#22505F', more_colors_second = '#00827E', more_colors_third = '#4CB8E8', more_colors_fourth = '#919191';

function getFirstChart() {
    //Bloque de la visualización
    let chartBlock = d3.select('#chart-one');

    //Lectura de datos
    let localFile = './data/chart-one.csv';
    d3.csv(localFile, function(d) {
        return {
            tipo: d.city,
            porcentaje: +d['m2_per_capita'].replace(/,/g, '.')
        }
    }, function(error, data) {
        if (error) throw error;
        data = data.reverse();
        //Creación del elemento SVG en el contenedor
        let margin = {top: 5, right: 17.5, bottom: 25, left: 85};
        let {width, height, chart} = setChart(chartBlock, margin);

        //Disposición del eje X
        let x = d3.scaleLinear()
            .domain([0,100])
            .range([10, width])
            .nice();

        //Estilos para eje X
        let xAxis = function(g){
            g.call(d3.axisBottom(x).ticks(6).tickFormat(function(d) { return d + '%'; }))
            g.call(function(g){
                g.selectAll('.tick line')
                    .attr('class', function(d,i) {
                        if (d == 0) {
                            return 'line-special';
                        }
                    })
                    .attr('y1', '0%')
                    .attr('y2', `-${height}`)
            })
            g.call(function(g){g.select('.domain').remove()});
        }

        //Inicialización eje X
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //Disposición del eje Y
        let y = d3.scaleBand()
            .domain(data.map(function(d) { return d.tipo; }))
            .range([height, 0]);

        let yAxis = function(svg){
            svg.call(d3.axisLeft(y).tickFormat(function(d) { return d; }))
            svg.call(function(g){g.selectAll('.tick line').remove()})
            svg.call(function(g){g.select('.domain').remove()});
        }        
        
        chart.append("g")
            .call(yAxis);

        //Visualización de datos
        // window.addEventListener('scroll', function() {
        //     if (!chartBlock.node().classList.contains('visible')){
        //         if(isElementInViewport(chartBlock.node())){
        //             chartBlock.node().classList.add('visible');
        //             initChart();
        //         }                
        //     }
        // });

        initChart();

        function initChart() {
            chart.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr('class', function(d, i) { return `bar bar-${i}`; })
                .style('fill', one_color)
                .attr("x", function (d) {
                    return x(0);
                })
                .attr("y", function (d) {
                    return y(d.tipo) + y.bandwidth() / 4;
                })            
                .attr("height", y.bandwidth() / 2)
                .on('mouseenter mousedown mousemove mouseover', function(d, i, e) {
                    let css = e[i].getAttribute('class').split('-')[1];
                    //Texto
                    let html = `<p class="chart__tooltip--title">${d.tipo}</p>
                                <p class="chart__tooltip--text">${numberWithCommas(d.porcentaje.toFixed(2))}%</p>`; //Solucionar recogida de información

                    tooltip.html(html);

                    //Posibilidad visualización línea diferente
                    let bars = chartBlock.selectAll('.bar');
                    
                    bars.each(function() {
                        this.style.opacity = '0.4';
                        if(this.getAttribute('class').indexOf(`bar-${css}`) != -1) {
                            this.style.opacity = '1';
                        }
                    });

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d, i, e) {
                    //Quitamos los estilos de la línea
                    let bars = chartBlock.selectAll('.bar');
                    bars.each(function() {
                        this.style.opacity = '1';
                    });

                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(3000)
                .attr("x", function (d) {
                    return x(Math.min(0, d.porcentaje));
                })
                .attr("width", function (d) {
                    return Math.abs(x(d.porcentaje) - x(0));
                });
        }                   
    });
}

function getSecondChart() {
    //Bloque de la visualización
    let chartBlock = d3.select('#chart-two');

    //Lectura de datos
    let localFile = './data/chart-two.csv';
    d3.csv(localFile, function(error, data) {
        if (error) throw error;

        let columns = data.columns.slice(1);
        let newData = [];
        for(let i = 0; i < columns.length; i++) {
            newData.push({tipo: columns[i], valor: +data[0][`${columns[i]}`]});
        }

        //Creación del elemento SVG en el contenedor
        let margin = {top: 15, right: 5, bottom: 120, left: 30};
        let {width, height, chart} = setChart(chartBlock, margin);

        //Disposición del eje X
        let x = d3.scaleBand()
            .domain(columns.map(function(d) { return d; }))
            .range([0, width]);

        //Estilos para eje X
        let xAxis = function(g){
            g.call(d3.axisBottom(x).tickFormat(function(d) { return d; }))
            g.call(function(g){g.selectAll('.tick line').remove()})
            g.call(function(g){g.select('.domain').remove()})
            g.call(function(g){
                g.selectAll('.tick text')
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-65)" 
                    });
            });
        }

        //Inicialización eje X
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //Disposición del eje Y
        let y = d3.scaleLinear()
            .domain([0,60])
            .range([height, 0]);

        let yAxis = function(svg){
            svg.call(d3.axisLeft(y).ticks(3).tickFormat(function(d) { return d; }))
            svg.call(function(g){
                g.selectAll('.tick line')
                    .attr('class', function(d,i) {
                        if (d == 0) {
                            return 'line-special';
                        }
                    })
                    .attr('x1', '0%')
                    .attr('x2', `${width}`)
            })
            svg.call(function(g){g.select('.domain').remove()});
        }

        chart.append("g")
            .call(yAxis);

        //Visualización de datos
        window.addEventListener('scroll', function() {
            if (!chartBlock.node().classList.contains('visible')){
                if(isElementInViewport(chartBlock.node())){
                    chartBlock.node().classList.add('visible');
                    initChart();
                }                
            }
        });

        function initChart() {
            chart.selectAll(".bar")
                .data(newData)
                .enter()
                .append("rect")
                .attr('class', function(d, i) { return `bar bar-${i}`; })
                .style('fill', one_color)
                .attr("y", function (d) {
                    return y(0);
                })
                .attr("x", function (d, i) {
                    return x(d.tipo) + x.bandwidth() / 4;                                       
                })            
                .attr("width", x.bandwidth() / 2)
                .on('mouseenter mousedown mousemove mouseover', function(d, i, e) {
                    let css = e[i].getAttribute('class').split('-')[1];
                    //Texto
                    let html = `<p class="chart__tooltip--title">${d.tipo}</p>
                                <p class="chart__tooltip--text">${d.valor}</p>`;

                    tooltip.html(html);

                    //Posibilidad visualización línea diferente
                    let bars = chartBlock.selectAll('.bar');
                    
                    bars.each(function() {
                        this.style.opacity = '0.4';
                        if(this.getAttribute('class').indexOf(`bar-${css}`) != -1) {
                            this.style.opacity = '1';
                        }
                    });

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d, i, e) {
                    //Quitamos los estilos de la línea
                    let bars = chartBlock.selectAll('.bar');
                    bars.each(function() {
                        this.style.opacity = '1';
                    });

                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(3000)
                .attr("y", function (d, i) {
                    return y(d.valor);                                        
                })
                .attr("height", function (d, i) {
                    return height - y(d.valor);                                        
                });
        }                   
    });
}

function getSecondBisChart() {
    //Bloque de la visualización
    let chartBlock = d3.select('#chart-two_bis');

    //Lectura de datos
    let localFile = './data/chart-two_bis.csv';
    d3.csv(localFile, function(error, data) {
        if (error) throw error;

        let columns = data.columns.slice(1);
        let newData = [];
        for(let i = 0; i < columns.length; i++) {
            newData.push({tipo: columns[i], valor: +data[0][`${columns[i]}`]});
        }

        //Creación del elemento SVG en el contenedor
        let margin = {top: 15, right: 5, bottom: 120, left: 30};
        let {width, height, chart} = setChart(chartBlock, margin);

        //Disposición del eje X
        let x = d3.scaleBand()
            .domain(columns.map(function(d) { return d; }))
            .range([0, width]);

        //Estilos para eje X
        let xAxis = function(g){
            g.call(d3.axisBottom(x).tickFormat(function(d) { return d; }))
            g.call(function(g){g.selectAll('.tick line').remove()})
            g.call(function(g){g.select('.domain').remove()})
            g.call(function(g){
                g.selectAll('.tick text')
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-65)" 
                    });
            });
        }

        //Inicialización eje X
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //Disposición del eje Y
        let y = d3.scaleLinear()
            .domain([0,400])
            .range([height, 0]);

        let yAxis = function(svg){
            svg.call(d3.axisLeft(y).ticks(3).tickFormat(function(d) { return d; }))
            svg.call(function(g){
                g.selectAll('.tick line')
                    .attr('class', function(d,i) {
                        if (d == 0) {
                            return 'line-special';
                        }
                    })
                    .attr('x1', '0%')
                    .attr('x2', `${width}`)
            })
            svg.call(function(g){g.select('.domain').remove()});
        }

        chart.append("g")
            .call(yAxis);

        //Visualización de datos
        window.addEventListener('scroll', function() {
            if (!chartBlock.node().classList.contains('visible')){
                if(isElementInViewport(chartBlock.node())){
                    chartBlock.node().classList.add('visible');
                    initChart();
                }                
            }
        });

        function initChart() {
            chart.selectAll(".bar")
                .data(newData)
                .enter()
                .append("rect")
                .attr('class', function(d, i) { return `bar bar-${i}`; })
                .style('fill', one_color)
                .attr("y", function (d) {
                    return y(0);
                })
                .attr("x", function (d, i) {
                    return x(d.tipo) + x.bandwidth() / 4;                                       
                })            
                .attr("width", x.bandwidth() / 2)
                .on('mouseenter mousedown mousemove mouseover', function(d, i, e) {
                    let css = e[i].getAttribute('class').split('-')[1];
                    //Texto
                    let html = `<p class="chart__tooltip--title">${d.tipo}</p>
                                <p class="chart__tooltip--text">${d.valor}</p>`;

                    tooltip.html(html);

                    //Posibilidad visualización línea diferente
                    let bars = chartBlock.selectAll('.bar');
                    
                    bars.each(function() {
                        this.style.opacity = '0.4';
                        if(this.getAttribute('class').indexOf(`bar-${css}`) != -1) {
                            this.style.opacity = '1';
                        }
                    });

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d, i, e) {
                    //Quitamos los estilos de la línea
                    let bars = chartBlock.selectAll('.bar');
                    bars.each(function() {
                        this.style.opacity = '1';
                    });

                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(3000)
                .attr("y", function (d, i) {
                    return y(d.valor);                                        
                })
                .attr("height", function (d, i) {
                    return height - y(d.valor);                                        
                });
        }                   
    });
}

function getThirdChart() {
    //Bloque de la visualización
    let chartBlock = d3.select('#chart-three');

    //Lectura de datos
    let localFile = './data/chart-three.csv';
    d3.csv(localFile, function(d) {
        return {
            tipo: d.city,
            'within_100m': +d['within_100m'].replace(/,/g, '.').replace('%',''),
            'within_100_200m': +d['within_100_200m'].replace(/,/g, '.').replace('%',''),
            'within_200_400m': +d['within_200_400m'].replace(/,/g, '.').replace('%',''),
            'within_400m_1km': +d['within_400m_1km'].replace(/,/g, '.').replace('%','')
        }
    }, function(error, data) {
        if (error) throw error;
        
        data = data.reverse();
        //Creación del elemento SVG en el contenedor
        let margin = {top: 5, right: 17.5, bottom: 25, left: 90};
        let {width, height, chart} = setChart(chartBlock, margin);

        let keys = data.columns.slice(1);
        
        //Colores
        let z = d3.scaleOrdinal()
            .range([more_colors_first, more_colors_second, more_colors_third, more_colors_fourth])
            .domain(keys);

        //Disposición del eje X
        let x = d3.scaleLinear()
            .domain([0,100])
            .range([10, width])
            .nice();

        //Estilos para eje X
        let xAxis = function(g){
            g.call(d3.axisBottom(x).ticks(6).tickFormat(function(d) { return d + '%'; }))
            g.call(function(g){
                g.selectAll('.tick line')
                    .attr('class', function(d,i) {
                        if (d == 0) {
                            return 'line-special';
                        }
                    })
                    .attr('y1', '0%')
                    .attr('y2', `-${height}`)
            })
            g.call(function(g){g.select('.domain').remove()});
        }

        //Inicialización eje X
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //Disposición del eje Y
        let y = d3.scaleBand()
            .domain(data.map(function(d) { return d.tipo; }))
            .range([height, 0]);

        let yAxis = function(svg){
            svg.call(d3.axisLeft(y).tickFormat(function(d) { return d; }))
            svg.call(function(g){g.selectAll('.tick line').remove()})
            svg.call(function(g){g.select('.domain').remove()});
        }        
        
        chart.append("g")
            .call(yAxis);

        //Visualización de datos
        window.addEventListener('scroll', function() {
            if (!chartBlock.node().classList.contains('visible')){
                if(isElementInViewport(chartBlock.node())){
                    chartBlock.node().classList.add('visible');
                    initChart();
                }                
            }
        });

        function initChart() {
            chart.selectAll('.bar')
                .data(d3.stack().keys(keys)(data))
                .enter()
                .append("g")
                .attr("fill", function(d) { return z(d.key); })
                .attr("class", function(d) { return 'g_rect rect-' + d.key; })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")                
                .attr("y", function(d) { return y(d.data.tipo) + y.bandwidth() / 4; })
                .attr("x", function(d) { return x(0); })
                .attr("height", y.bandwidth() / 2)
                .on('mouseenter mousedown mousemove mouseover', function(d, i, e) {
                    let css = e[i].parentNode.getAttribute('class').split('-')[1];
                    let currentData = {city: d.data.tipo, data: d.data[`${css}`]};
                    //Texto
                    let html = `<p class="chart__tooltip--title">${currentData.city}</p>
                                <p class="chart__tooltip--text">${currentData.data}%</p>`; //Solucionar recogida de información

                    tooltip.html(html);

                    //Posibilidad visualización línea diferente
                    let bars = chartBlock.selectAll('.g_rect');
                    
                    bars.each(function() {
                        this.style.opacity = '0.2';
                        if(this.getAttribute('class').indexOf(`rect-${css}`) != -1) {
                            this.style.opacity = '1';
                        }
                    });

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d, i, e) {
                    //Quitamos los estilos de la línea
                    let bars = chartBlock.selectAll('.g_rect');
                    bars.each(function() {
                        this.style.opacity = '1';
                    });

                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(3000)
                .attr("x", function(d) { return x(d[0]); })	
                .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        }                
    });
}

getFirstChart();
getSecondChart();
getSecondBisChart();
getThirdChart();

/* Visualization helpers */
function isElementInViewport(ele) {
    const { top, bottom } = ele.getBoundingClientRect();
    const vHeight = (window.innerHeight || document.documentElement.clientHeight);
    
    return ( 
        (top > 0 || bottom > 0) && bottom < vHeight
    );
};

// PRUEBA SCROLL PARA INICIAR ANIMACIÓN CUANDO ENTRE
let charts = document.getElementsByClassName('chart__viz');

/* Inicialización del gráfico */
function setChart(chartBlock, margin) {
    let width = parseInt(chartBlock.style('width')) - margin.left - margin.right,
    height = parseInt(chartBlock.style('height')) - margin.top - margin.bottom;

    let chart = chartBlock
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return {margin, width, height, chart};
}

function numberWithCommas(x) {
    //return x.toString().replace(/\./g, ',').replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
    return x.toString().replace(/\./g, ',');
}

function setOpacitySwitch(id, state) {
    let elem = document.getElementById(id);
    
    if (state == true) {
        elem.previousElementSibling.style.opacity = 0.25;
        elem.nextElementSibling.style.opacity = 1;
    } else {
        elem.nextElementSibling.style.opacity = 0.25;
        elem.previousElementSibling.style.opacity = 1;
    }
}