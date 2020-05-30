var svgWidth = 960;
var svgHeight = 500;

var margin ={
    top: 20,
    right: 40,
    bottom: 90,
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
 //Initial chosen axis:
 var chosenXAxis="poverty" ;
 var chosenYAxis="healthcare";  
 
//Scaling xaxis function
function xScale(newsData, chosenXAxis){
    var xLinearScale= d3.scaleLinear()
    .domain([d3.min(newsData, d=>d[chosenXAxis])-1,d3.max(newsData, d=>d[chosenXAxis])+1])
    .range([0,width]);

    return xLinearScale;

} 

//Scaling y axis function
function yScale(newsData, chosenYAxis){
    var yLinearScale= d3.scaleLinear()
    .domain([d3.min(newsData, d=>d[chosenYAxis])-1,d3.max(newsData, d=>d[chosenYAxis])+1])
    .range([height,0]);

    return yLinearScale;

} 

//rendering the changed axis
function renderAxes(newScale,chosenAxis,axis){
    if (chosenAxis=="poverty"|| chosenAxis=="age"|| chosenAxis=="income"){
        var bottomAxis= d3.axisBottom(newScale);
        axis.transition()
            .duration(1000)
            .call(bottomAxis);
        return axis;
    }
    else if (chosenAxis=="healthcare"|| chosenAxis=="smokes"|| chosenAxis=="obesity"){
        var leftAxis= d3.axisLeft(newScale);
        axis.transition()
            .duration(1000)
            .call(leftAxis);
        return axis;
    }
}

//rendering the changed circles
function renderCircles(circlesGroup,newScale,chosenAxis){
    if (chosenAxis=="poverty"|| chosenAxis=="age"|| chosenAxis=="income"){
        circlesGroup.transition()
                    .duration(1000)
                    .attr("cx",d => newScale(d[chosenAxis]));
        return circlesGroup;
    }
    else if (chosenAxis=="healthcare"|| chosenAxis=="smokes"|| chosenAxis=="obesity"){
        circlesGroup.transition()
        .duration(1000)
        .attr("cy",d => newScale(d[chosenAxis]));
        return circlesGroup; 
    }

}


//rendering circle labels
function renderCircleLabels(circlesLabels,newScale,chosenAxis){
    if (chosenAxis=="poverty"|| chosenAxis=="age"|| chosenAxis=="income"){
        circlesLabels.transition()
                    .duration(1000)
                    .attr("x",d => newScale(d[chosenAxis]));
        return circlesLabels;
    }
    else if (chosenAxis=="healthcare"|| chosenAxis=="smokes"|| chosenAxis=="obesity"){
        circlesLabels.transition()
        .duration(1000)
        .attr("y",d => newScale(d[chosenAxis]));
        return circlesLabels; 
    }

}

//Updating tooltip function
function updateToolTip(chosenXAxis,chosenYAxis,circlesGroup){
    var xLabel;
    var yLabel;
    if(chosenXAxis === "poverty"){
        xLabel ="Poverty(%)";
    }
    else if (chosenXAxis === "age"){
        xLabel = "Age";
    }
    else {xLabel = "Income";}

    if(chosenYAxis === "healthcare"){
        yLabel="Healthcare(%)";
    }
    else if (chosenYAxis=== "smokes"){
        yLabel = "Smokes(%)";
    }
    else {yLabel= "Obesity(%)";}


    var toolTip =d3.tip()
                    .attr("class","d3-tip")
                    .offset([80,-60])
                    .html(function(d){
                        return (`<strong>${d.state}</strong><br> ${xLabel} : ${d[chosenXAxis]}<br> ${yLabel} : ${d[chosenYAxis]}`)
                    });
                    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });

    return circlesGroup;

}


 //csv reading
d3.csv("assets/data/data.csv").then(function(newsData){

    //Parse to integer
    newsData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.age= +data.age;
        data.obesity= +data.obesity;
        data.income= +data.income;
    });
    //xlinearScale function
    var xLinearScale= xScale(newsData, chosenXAxis);
    var yLinearScale= yScale(newsData, chosenYAxis);

    //Creating initial Axis
    var bottomAxis= d3.axisBottom(xLinearScale);
    var leftAxis= d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    var yAxis=chartGroup.append("g")
    .call(leftAxis);

    //Create circles
    var circlesGroup=chartGroup.selectAll("circles")
                                .data(newsData)
                                .enter()
                                .append("circle")
                                .attr("cx",d => xLinearScale(d[chosenXAxis]))
                                .attr("cy",d => yLinearScale(d[chosenYAxis]))
                                .attr("r","10")
                                .classed("stateCircle",true);

    var circlesLabels=chartGroup.selectAll("circles").data(newsData).enter()           
            .append("text")
            .attr("x",d => xLinearScale(d.poverty))
            .attr("y",d => yLinearScale(d.healthcare))
            .attr("dy","0.5em")
            .attr("dx","-0.1em")
            .attr("font-size","0.6em")
            .classed("stateText",true)
            .text( d => d.abbr);

    //Adding ToolTip 
   var circlesGroup= updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);
    

    //Group for x Axis labels
    var xLabelsGroup= chartGroup.append("g")
                                .attr("transform",`translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "poverty") // value to grab for event listener
                                .classed("active", true)
                                .text("Poverty(%)");
    var ageLabel = xLabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("value", "age") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Age(median)");
    var incomeLabel = xLabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 60)
                                .attr("value", "income") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Household Income(median)");                            


    //Group for y Axis labels
    var yLabelsGroup= chartGroup.append("g")
                               .attr("transform","rotate(-90)");
    
    var healthLabel = yLabelsGroup.append("text")
    //.attr("transform","rotate(-90)")
                                .attr("y", 0- margin.left+70)
                                .attr("x", 0-(height/2))
                                .attr("value", "healthcare") // value to grab for event listener
                                .classed("active", true)
                                .text("Lacks Healthcare(%)");
    var smokeLabel = yLabelsGroup.append("text")
    //.attr("transform","rotate(-90)")
                                .attr("y", 0-margin.left+50)
                                .attr("x", 0-(height/2))
                                .attr("value", "smokes") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Smokes(%)");
    var obeseLabel = yLabelsGroup.append("text")
    //.attr("transform","rotate(-90)")
                                .attr("y", 0-margin.left+30)
                                .attr("x", 0-(height/2))
                                .attr("value", "obesity") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Obese(%)");                            
    
    // x axis labels event listner
    xLabelsGroup.selectAll("text")
        .on("click",function(){
//Getting the value selected
    var value =d3.select(this).attr("value");
    if(value !== chosenXAxis){
        //new chosen value
        chosenXAxis= value;
        //rendering the new scale
        xLinearScale=xScale(newsData,chosenXAxis);
        //rendering the new axis
        xAxis= renderAxes(xLinearScale,chosenXAxis,xAxis);
        // rendering the new circles and their labels
        circlesGroup= renderCircles(circlesGroup,xLinearScale,chosenXAxis);
        circlesLabels=renderCircleLabels(circlesLabels,xLinearScale,chosenXAxis);

        //Updating the tooltip
        circlesGroup=updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

        //change the chosen axis to bold
        if(chosenXAxis ==="age"){
            povertyLabel.classed("active",false)
                        .classed("inactive",true);
            ageLabel.classed("active",true)
                    .classed("inactive",false);
            incomeLabel.classed("active",false)
                        .classed("inactive",true);

        }
        else if(chosenXAxis ==="income"){
            povertyLabel.classed("active",false)
                        .classed("inactive",true);
            ageLabel.classed("active",false)
                    .classed("inactive",true);
            incomeLabel.classed("active",true)
                        .classed("inactive",false);
                        

        }
        else if(chosenXAxis ==="poverty"){
            povertyLabel.classed("active",true)
                        .classed("inactive",false);
            ageLabel.classed("active",false)
                    .classed("inactive",true);
            incomeLabel.classed("active",false)
                        .classed("inactive",true);
                        

        }

}

                })
                //console.log(chosenXAxis);

    yLabelsGroup.selectAll("text")
                .on("click",function(){
        //Getting the value selected
        console.log(chosenXAxis);
            var value =d3.select(this).attr("value");
            if(value !== chosenYAxis){
                //new chosen value
                chosenYAxis= value;
                //rendering the new scale
                yLinearScale=yScale(newsData,chosenYAxis);
                //rendering the new axis
                yAxis= renderAxes(yLinearScale,chosenYAxis,yAxis);
                // rendering the new circles and their labels
                circlesGroup= renderCircles(circlesGroup,yLinearScale,chosenYAxis);
                circlesLabels=renderCircleLabels(circlesLabels,yLinearScale,chosenYAxis);
                
                //Updating the tooltip
                circlesGroup=updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

                //change the chosen axis to bold
                if(chosenYAxis ==="smokes"){
                    healthLabel.classed("active",false)
                                .classed("inactive",true);
                    smokeLabel.classed("active",true)
                            .classed("inactive",false);
                    obeseLabel.classed("active",false)
                                .classed("inactive",true);
        
                }
                else if(chosenYAxis ==="obesity"){
                    healthLabel.classed("active",false)
                                .classed("inactive",true);
                    smokeLabel.classed("active",false)
                            .classed("inactive",true);
                    obeseLabel.classed("active",true)
                                .classed("inactive",false);
                                
        
                }
                else if(chosenYAxis ==="healthcare"){
                    healthLabel.classed("active",true)
                                .classed("inactive",false);
                    smokeLabel.classed("active",false)
                            .classed("inactive",true);
                    obeseLabel.classed("active",false)
                                .classed("inactive",true);
                                
        
                }
        
        }
        })

    })