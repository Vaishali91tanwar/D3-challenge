// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin ={
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};


// Dimensions for chart group
var width= svgWidth-margin.left-margin.right;
var height = svgHeight- margin.top-margin.bottom;


// Adding the svg element
var svg= d3.select("#scatter")
            .append("svg")
            .attr("width",svgWidth)
            .attr("height",svgHeight);

//Adding the chart group

var chartGroup = svg.append("g")
                    .attr("transform",`translate(${margin.left},${margin.top})`);
                   
d3.csv("assets/data/data.csv").then(function(newsData){

    //Parse to integer
    newsData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    //Create scale functions

    var xLinearScale= d3.scaleLinear()
                        .domain([d3.min(newsData, d=>d.poverty)-0.5,d3.max(newsData, d=>d.poverty)])
                        .range([0,width]);
    var yLinearScale= d3.scaleLinear()
                        .domain([d3.min(newsData, d=>d.healthcare)-0.5,d3.max(newsData, d=>d.healthcare)])
                        .range([height,0]);
    //Create axis functions
    var bottomAxis= d3.axisBottom(xLinearScale);
    var leftAxis= d3.axisLeft(yLinearScale);

    //Append the Axes

    chartGroup.append("g")
                .attr("transform",`translate(0,${height})`)
                .call(bottomAxis);
    chartGroup.append("g")
                .call(leftAxis);

    //Create circles
     var circlesGroup=chartGroup.selectAll("circles")
                                .data(newsData)
                                .enter()
                                .append("circle")
                                .attr("cx",d => xLinearScale(d.poverty))
                                .attr("cy",d => yLinearScale(d.healthcare))
                                .attr("r","10")
                                .classed("stateCircle",true);
                                //.attr("fill","lightblue");

     chartGroup.selectAll("circles").data(newsData).enter()           
                                    .append("text")
                                    //.attr("fill","white")
                                .attr("x",d => xLinearScale(d.poverty))
                                .attr("y",d => yLinearScale(d.healthcare))
                                .attr("dy","0.5em")
                                .attr("dx","-0.1em")
                                .attr("font-size","0.6em")
                                .classed("stateText",true)
                                .text( d => d.abbr);
                                //.attr("opacity",".5");
    //Initialise tool tip
    var toolTip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([80,-60])
                    .html(function(d){
                        return (`<strong>${d.state}</strong><br> Poverty: ${d.poverty}% <br> Healthcare: ${d.healthcare}%`)
                    });
    //Create the tooltip
    chartGroup.call(toolTip);

    //create mouseover
    circlesGroup.on("mouseover",function(d){
        toolTip.show(d,this);
        
    })
    .on("mouseout",function(d){
        toolTip.hide(d);
    });

    //Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "active")
      .text("Healthcare %");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "active")
      .text("Poverty %");
  }).catch(function(error) {
    console.log(error);
            
});