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
        let margin = {top: 5, right: 17.5, bottom: 25, left: 100};
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
        let margin = {top: 15, right: 5, bottom: 140, left: 30};
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
            })
            g.call(function(g){g.selectAll('.tick text').on('mouseenter mousemove', function(d) {
                
                //Texto tooltip
                let texto = '';
                switch(d) {
                    case 'Parques de bolsillo':
                        texto = 'Parques de bolsillo: Menos de 0.4 has';
                        break;
                    case 'Parques pequeños':
                        texto = 'Parques pequeños: Entre 0.4 y 2 has';
                        break;
                    case 'Parques distritales':
                        texto = 'Parques distritales: Entre 2 y 20 has';
                        break;
                    case 'Parques metropolitanos':
                        texto = 'Parques metropolitanos: Entre 20 y 60 has';
                        break;
                    case 'Parques regionales':
                        texto = 'Parques regionales: Entre 60 y 200 has';
                        break;
                    default:
                        texto = '';
                        break;
                }

                let html = `<p class="chart__tooltip--title">${texto}</p>`;                
                tooltip.html(html);

                //Tooltip
                positionTooltip(window.event, tooltip);
                getInTooltip(tooltip);
            })});
            g.call(function(g){g.selectAll('.tick text').on('mouseleave', function(d) { 
                //Quitamos el tooltip
                getOutTooltip(tooltip); 
            })});
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
                                <p class="chart__tooltip--text">${d.valor}%</p>`;

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
        let margin = {top: 15, right: 5, bottom: 140, left: 30};
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
            })
            g.call(function(g){g.selectAll('.tick text').on('mouseenter mousemove', function(d) {
                let texto = '';
                switch(d) {
                    case 'Parques de bolsillo':
                        texto = 'Parques de bolsillo: Menos de 0.4 has';
                        break;
                    case 'Parques pequeños':
                        texto = 'Parques pequeños: Entre 0.4 y 2 has';
                        break;
                    case 'Parques distritales':
                        texto = 'Parques distritales: Entre 2 y 20 has';
                        break;
                    case 'Parques metropolitanos':
                        texto = 'Parques metropolitanos: Entre 20 y 60 has';
                        break;
                    case 'Parques regionales':
                        texto = 'Parques regionales: Entre 60 y 200 has';
                        break;
                    default:
                        texto = '';
                        break;
                }

                //Texto tooltip
                let html = `<p class="chart__tooltip--title">${texto}</p>`;                
                tooltip.html(html);

                //Tooltip
                positionTooltip(window.event, tooltip);
                getInTooltip(tooltip);
            })});
            g.call(function(g){g.selectAll('.tick text').on('mouseleave', function(d) { 
                //Quitamos el tooltip
                getOutTooltip(tooltip); 
            })});
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
                                <p class="chart__tooltip--text">${d.valor}%</p>`;

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
        let margin = {top: 5, right: 17.5, bottom: 25, left: 100};
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

///////// INTEGRACIÓN DE LÓGICA DE MAPAS ////////

///// SAN SALVADOR
//Variables globales
let mapSS, popupSS;
let currentBtnSS = 'btnZonasVerdesSS', currentLegendSS = 'ldZonasVerdesSS';

initDataSS();

document.getElementById('btnZonasVerdesSS').addEventListener('click', function () {
    if(currentBtnSS != 'btnZonasVerdesSS') {
        //Cambio variables
        currentBtnSS = 'btnZonasVerdesSS';
        currentLegendSS ='ldZonasVerdesSS';

        //Ejecución funciones
        setBtnSS(currentBtnSS);
        setLegendSS(currentLegendSS);
        updatemapSS('salvador_pop_overcrowd');
    }    
});

document.getElementById('btnCallesSS').addEventListener('click', function () {
    if(currentBtnSS != 'btnCallesSS') {
        //Cambio variables
        currentBtnSS = 'btnCallesSS';
        currentLegendSS ='ldCallesSS';

        //Ejecución funciones
        setBtnSS(currentBtnSS);
        setLegendSS(currentLegendSS);
        updatemapSS('salvador_roads_distance');
    }
});

document.getElementById('btnPoblacionSS').addEventListener('click', function () {
    if(currentBtnSS != 'btnPoblacionSS') {
        //Cambio variables
        currentBtnSS = 'btnPoblacionSS';
        currentLegendSS ='ldPoblacionSS';

        //Ejecución funciones
        setBtnSS(currentBtnSS);
        setLegendSS(currentLegendSS);
        updatemapSS('salvador_pop');
    }    
});

document.getElementById('btnOvercrowdSS').addEventListener('click', function () {
    if(currentBtnSS != 'btnOvercrowdSS') {
        //Cambio variables
        currentBtnSS = 'btnOvercrowdSS';
        currentLegendSS ='ldOvercrowdSS';

        //Ejecución funciones
        setBtnSS(currentBtnSS);
        setLegendSS(currentLegendSS);
        updatemapSS('salvador_overcrowd');
    }    
});

//Funciones del mapa
function initDataSS() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybG9tdW5veiIsImEiOiJjazcwZW8wZ2sxZWFyM2VtdnQwdjVpMXBuIn0.ltacbidw9otoDaT1RLCNcA';
    mapSS = new mapboxgl.Map({
        container: 'mapboxSS',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-89.184, 13.740],
        minZoom: 10,
        zoom: 11
    });

    /* Tooltip */
    popupSS = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    const nav = new mapboxgl.NavigationControl({showCompass: false});
    mapSS.addControl(nav, 'top-right');

    mapSS.on('load', function() {
        //Fuente de datos
        mapSS.addSource('ss_greenspace', {
            'type': 'vector',
            'url': 'mapbox://carlomunoz.5e6solxl'
        });

        //Segunda fuente de datos > Ahora mismo tenemos el zoom especificado > Cambiar
        mapSS.addSource('ss_roads', {
            'type': 'vector',
            'url': 'mapbox://carlomunoz.9jjf5mkz'
        });

        //Layer > Espacios verdes
        mapSS.addLayer(
            {
            'id': 'layer_ss_greenspace',
            'source': 'ss_greenspace',
            'source-layer': 'salvador_pop_overcrowd-4sr8g5',
            'layout': {'visibility': 'visible'},
            'type': 'fill',
            'paint': {
                'fill-color': "#63DAAF",
                'fill-opacity': 1
            }
            }
        );

        mapSS.addLayer({
            'id': 'layer_ss_pop',
            'source': 'ss_greenspace',
            'source-layer': 'salvador_pop_overcrowd-4sr8g5',
            'layout': {'visibility': 'none'},           
            'type': 'fill',
            'paint': {
                'fill-color': [
                    'step',
                    ['get', 'pop_400m'],
                    '#095677',
                    2500,
                    '#9B918C',
                    5000,
                    '#FEB531',
                    7500,
                    '#9CBDD2',
                    10000,
                    'red'
                ],
                'fill-opacity': 1
            }
        });

        mapSS.addLayer({
            'id': 'layer_ss_overcrowd',
            'source': 'ss_greenspace',
            'source-layer': 'salvador_pop_overcrowd-4sr8g5',
            'layout': {'visibility': 'none'},           
            'type': 'fill',
            'paint': {
                'fill-color': [
                    'step',
                    ['get', 'overcrowd'],
                    '#095677',
                    200,
                    '#9B918C',
                    400,
                    '#FEB531',
                    700,
                    '#9CBDD2',
                    1000,
                    'red'
                ],
                'fill-opacity': 1
            }
        });
        
        //Layer > Callejero
        mapSS.addLayer({
            'id': 'layer_ss_roads',
            'source': 'ss_roads',
            'source-layer': 'san_roads_distance-5dowds',
            'layout': {'visibility': 'none'},           
            'type': 'line',
            'paint': {
                'line-color': [
                    'step',
                    ['get', 'Hub distan'],
                    '#095677',
                    500,
                    '#9B918C',
                    1000,
                    '#FEB531',
                    1500,
                    '#9CBDD2'
                ],
                'line-width': 1.25
            }
        });

        //Dejar para hacerlo solo en mobile
        // if(window.innerWidth < 575) {
        //     mapSS.dragPan.disable();
        //     mapSS.scrollZoom.disable();
        // }        

        //Popup
        bind_event_ss('layer_ss_greenspace');
        bind_event_ss('layer_ss_pop');
        bind_event_ss('layer_ss_overcrowd');
        bind_event_ss('layer_ss_roads');
    });
}

function updatemapSS(tipo) {
    if (tipo == 'salvador_pop_overcrowd') {
        mapSS.setLayoutProperty('layer_ss_roads', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_pop', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_overcrowd', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_greenspace', 'visibility', 'visible');
    } else if (tipo == 'salvador_roads_distance') {
        mapSS.setLayoutProperty('layer_ss_pop', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_overcrowd', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_greenspace', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_roads', 'visibility', 'visible');
    } else if (tipo == 'salvador_pop') {
        mapSS.setLayoutProperty('layer_ss_pop', 'visibility', 'visible');
        mapSS.setLayoutProperty('layer_ss_overcrowd', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_greenspace', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_roads', 'visibility', 'none');
    } else {
        mapSS.setLayoutProperty('layer_ss_pop', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_overcrowd', 'visibility', 'visible');
        mapSS.setLayoutProperty('layer_ss_greenspace', 'visibility', 'none');
        mapSS.setLayoutProperty('layer_ss_roads', 'visibility', 'none');
    }
}

function setBtnSS(btn) {
    let btns = document.getElementsByClassName('btn-ss');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    document.getElementById(btn).classList.add('active');
}

function setLegendSS(legend) {
    let legends = document.getElementsByClassName('legend-ss');
    for (let i = 0; i < legends.length; i++) {
        legends[i].classList.remove('active');
    }
    document.getElementById(legend).classList.add('active');
}

/* TOOLTIP */
function bind_event_ss(id){
    mapSS.on('mousemove', id, function(e){
        //Comprobar el ID aquí o en la función del texto
        let propiedades = e.features[0];
        mapSS.getCanvas().style.cursor = 'pointer';
        var coordinates = e.lngLat;

        var tooltipText = get_tooltip_text_ss(propiedades, id);

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }        
        popupSS.setLngLat(coordinates)
            .setHTML(tooltipText)
            .addTo(mapSS);

        mapSS.getCanvas().style.cursor = 'pointer';
    });
    mapSS.on('mouseleave', id, function() {
        mapSS.getCanvas().style.cursor = '';
        popupSS.remove();
    });
}

function get_tooltip_text_ss(props, id) {
    console.log(props);
    let html = '';
    if(id == 'layer_ss_greenspace') {
        html = `<p>Hectáreas de esta zona: ${props.properties.area_ha}</p>`;
    } else if (id == 'layer_ss_roads') {
        html = `<p><b>Calle ${props.properties.name}</b></p>
            <p>Distancia a una zona verde: ${props.properties['Hub distan'].toFixed(0)} metros</p>`;
    } else if (id == 'layer_ss_pop') {
        html = `<p>Población dentro de los 400 metros: ${numberWithCommas(props.properties['pop_400m'].toFixed(1))}</p>`;
    } else {
        html = `Overcrowding: ${numberWithCommas(props.properties['overcrowd'].toFixed(1))}`;
    }
    return html;
}

//// BUENOS AIRES
//Variables globales
let mapBA, popupBA;
let currentBtnBA = 'btnZonasVerdesBA', currentLegendBA = 'ldZonasVerdesBA';

initDataBA();

document.getElementById('btnZonasVerdesBA').addEventListener('click', function () {
    if(currentBtnBA != 'btnZonasVerdesBA') {
        //Cambio variables
        currentBtnBA = 'btnZonasVerdesBA';
        currentLegendBA ='ldZonasVerdesBA';

        //Ejecución funciones
        setBtnBA(currentBtnBA);
        setLegendBA(currentLegendBA);
        updateMapBA('buenos_pop_overcrowd');
    }    
});

document.getElementById('btnCallesBA').addEventListener('click', function () {
    if(currentBtnBA != 'btnCallesBA') {
        //Cambio variables
        currentBtnBA = 'btnCallesBA';
        currentLegendBA ='ldCallesBA';

        //Ejecución funciones
        setBtnBA(currentBtnBA);
        setLegendBA(currentLegendBA);
        updateMapBA('buenos_roads_distance');
    }
});

document.getElementById('btnPoblacionBA').addEventListener('click', function () {
    if(currentBtnBA != 'btnPoblacionBA') {
        //Cambio variables
        currentBtnBA = 'btnPoblacionBA';
        currentLegendBA ='ldPoblacionBA';

        //Ejecución funciones
        setBtnBA(currentBtnBA);
        setLegendBA(currentLegendBA);
        updateMapBA('buenos_pop');
    }    
});

document.getElementById('btnOvercrowdBA').addEventListener('click', function () {
    if(currentBtnBA != 'btnOvercrowdBA') {
        //Cambio variables
        currentBtnBA = 'btnOvercrowdBA';
        currentLegendBA ='ldOvercrowdBA';

        //Ejecución funciones
        setBtnBA(currentBtnBA);
        setLegendBA(currentLegendBA);
        updateMapBA('buenos_overcrowd');
    }    
});

//Funciones del mapa
function initDataBA() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybG9tdW5veiIsImEiOiJjazcwZW8wZ2sxZWFyM2VtdnQwdjVpMXBuIn0.ltacbidw9otoDaT1RLCNcA';
    mapBA = new mapboxgl.Map({
        container: 'mapboxBA',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-58.5033387, -34.6158037],
        minZoom: 9,
        zoom: 9
    });

    /* Tooltip */
    popupBA = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    const nav = new mapboxgl.NavigationControl({showCompass: false});
    mapBA.addControl(nav, 'top-right');

    mapBA.on('load', function() {
        //Fuente de datos
        mapBA.addSource('ba_greenspace', {
            'type': 'vector',
            'url': 'mapbox://carlomunoz.8z3ymagb'
        });

        //Segunda fuente de datos > Ahora mismo tenemos el zoom especificado > Cambiar
        mapBA.addSource('ba_roads', {
            'type': 'vector',
            'url': 'mapbox://carlomunoz.3vcrombp'
        });

        //Layer > Espacios verdes
        mapBA.addLayer(
            {
            'id': 'layer_ba_greenspace',
            'source': 'ba_greenspace',
            'source-layer': 'buenos_pop_overcrowd-7v3q8c',
            'layout': {'visibility': 'visible'},
            'type': 'fill',
            'paint': {
                'fill-color': "#63DAAF",
                'fill-opacity': 1
            }
            }
        );

        mapBA.addLayer({
            'id': 'layer_ba_pop',
            'source': 'ba_greenspace',
            'source-layer': 'buenos_pop_overcrowd-7v3q8c',
            'layout': {'visibility': 'none'},           
            'type': 'fill',
            'paint': {
                'fill-color': [
                    'step',
                    ['get', 'pop_400m'],
                    '#095677',
                    2500,
                    '#9B918C',
                    5000,
                    '#FEB531',
                    7500,
                    '#9CBDD2',
                    10000,
                    'red'
                ],
                'fill-opacity': 1
            }
        });

        mapBA.addLayer({
            'id': 'layer_ba_overcrowd',
            'source': 'ba_greenspace',
            'source-layer': 'buenos_pop_overcrowd-7v3q8c',
            'layout': {'visibility': 'none'},           
            'type': 'fill',
            'paint': {
                'fill-color': [
                    'step',
                    ['get', 'overcrowd'],
                    '#095677',
                    200,
                    '#9B918C',
                    400,
                    '#FEB531',
                    700,
                    '#9CBDD2',
                    1000,
                    'red'
                ],
                'fill-opacity': 1
            }
        });
        
        //Layer > Callejero
        mapBA.addLayer({
            'id': 'layer_ba_roads',
            'source': 'ba_roads',
            'source-layer': 'buenos_roads_distance',
            'layout': {'visibility': 'none'},           
            'type': 'line',
            'paint': {
                'line-color': [
                    'step',
                    ['get', 'Hub distan'],
                    '#095677',
                    500,
                    '#9B918C',
                    1000,
                    '#FEB531',
                    1500,
                    '#9CBDD2'
                ],
                'line-width': 1.25
            }
        });

        //Dejar para hacerlo solo en mobile
        // if(window.innerWidth < 575) {
        //     mapBA.dragPan.disable();
        //     mapBA.scrollZoom.disable();
        // }     

        //Popup
        bind_event_ba('layer_ba_greenspace');
        bind_event_ba('layer_ba_pop');
        bind_event_ba('layer_ba_overcrowd');
        bind_event_ba('layer_ba_roads');
    });
}

function updateMapBA(tipo) {
    if (tipo == 'buenos_pop_overcrowd') {
        mapBA.setLayoutProperty('layer_ba_roads', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_pop', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_overcrowd', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_greenspace', 'visibility', 'visible');
    } else if (tipo == 'buenos_roads_distance') {
        mapBA.setLayoutProperty('layer_ba_greenspace', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_pop', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_overcrowd', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_roads', 'visibility', 'visible');
    } else if (tipo == 'buenos_pop') {
        mapBA.setLayoutProperty('layer_ba_greenspace', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_pop', 'visibility', 'visible');
        mapBA.setLayoutProperty('layer_ba_overcrowd', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_roads', 'visibility', 'none');
    } else {
        mapBA.setLayoutProperty('layer_ba_greenspace', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_pop', 'visibility', 'none');
        mapBA.setLayoutProperty('layer_ba_overcrowd', 'visibility', 'visible');
        mapBA.setLayoutProperty('layer_ba_roads', 'visibility', 'none');
    }
}

function setBtnBA(btn) {
    let btns = document.getElementsByClassName('btn-ba');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    document.getElementById(btn).classList.add('active');
}

function setLegendBA(legend) {
    let legends = document.getElementsByClassName('legend-ba');
    for (let i = 0; i < legends.length; i++) {
        legends[i].classList.remove('active');
    }
    document.getElementById(legend).classList.add('active');
}

/* TOOLTIP */
function bind_event_ba(id){
    mapBA.on('mousemove', id, function(e){
        //Comprobar el ID aquí o en la función del texto
        let propiedades = e.features[0];
        mapBA.getCanvas().style.cursor = 'pointer';
        var coordinates = e.lngLat;

        var tooltipText = get_tooltip_text_ba(propiedades, id);

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }        
        popupBA.setLngLat(coordinates)
            .setHTML(tooltipText)
            .addTo(mapBA);

        mapBA.getCanvas().style.cursor = 'pointer';
    });
    mapBA.on('mouseleave', id, function() {
        mapBA.getCanvas().style.cursor = '';
        popupBA.remove();
    });
}

function get_tooltip_text_ba(props, id) {
    let html = '';
    if(id == 'layer_ba_greenspace') {
        html = `<p>Hectáreas de esta zona: ${props.properties.area_ha}</p>`;
    } else if (id == 'layer_ba_roads') {
        html = `<p><b>Calle ${props.properties.name}</b></p>
            <p>Distancia a una zona verde: ${props.properties['Hub distan'].toFixed(0)} metros</p>`;
    } else if (id == 'layer_ba_pop') {
        html = `<p>Población dentro de los 400 metros: ${numberWithCommas(props.properties['pop_400m'].toFixed(1))}</p>`;
    } else {
        html = `Overcrowding: ${numberWithCommas(props.properties['overcrowd'].toFixed(1))}`;
    }
    return html;
}

/* Helpers */
function numberWithCommas(x) {
    //return x.toString().replace(/\./g, ',').replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
    return x.toString().replace(/\./g, ',');
}