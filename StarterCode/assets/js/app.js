const svgWidth = 900;
const svgHeight = 600;

const margin = {
    top: 30,
    left: 100,
    bottom: 80,
    right: 30
};

const chartHeight = svgHeight - margin.top - margin.bottom;
const chartWidth = svgWidth - margin.right - margin.left;

let svg = d3.select("#scatter")
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth);

let chartGroup = svg.append("g")
                    .classed("chart", true)
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Choose default axes
let chosenXAxis = "poverty";
let chosenYAxis = "obesity";

// Create function to generate scaling for x axis
function XScale(censusdata, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
                        .domain([d3.min(censusdata, d => d[chosenXAxis]) * 0.9,
                                d3.max(censusdata, d => d[chosenXAxis]) * 1.1])
                        .range([0,chartWidth]);
    return xLinearScale;
}

// create function to update x axis on click
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// create function to generage scaling for y axis
function YScale(censusdata, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
                        .domain([d3.min(censusdata, d => d[chosenYAxis]) * 0.8,
                                d3.max(censusdata, d => d[chosenYAxis]) * 1.2])
                        .range([chartHeight, 0]);
    return yLinearScale;
} 

// create function to update y axis on click
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// create function to update circles group
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// create function to add abbr labels
function renderText(circleText, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circleText.transition()
                .duration(1000)
                .attr("x", d => newXScale(d[chosenXAxis]))
                .attr("y", d => newYScale(d[chosenYAxis]))
                .attr("text-anchor", "middle");

    return circleText;
}

function renderCircleText(chartGroup) {
    let circleText = chartGroup.selectAll("circle")
    .append("text")
    .classed("stateText", true)
    .attr("x", 0)
    .attr("y", 0)
    .text(function(d,i) { return d.abbr; });
    return circleText;
}
chartGroup.selectAll("circle")
    .append("text")
    .classed("stateText", true)
    .attr("x", 0)
    .attr("y", 0)
    .text(function(d,i) { return d.abbr; });
    //return circleText;


// create function to update tooltips based on axis
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText) {
    let xlabel;

    if (chosenXAxis === "poverty") {
        xlabel = "Poverty: ";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Age: ";
    }
    else {
        xlabel = "Household Income: ";
    }

    let ylabel;

    if (chosenYAxis === "obesity") {
        ylabel = "Obese: ";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokes: ";
    }
    else {
        ylabel = "Lacks Healthcare: ";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${ylabel} ${d[chosenYAxis]}
                                <br>${xlabel} ${d[chosenXAxis]}`)
        });

    circlesGroup.call(toolTip);
    //circleText.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    }).on("mouseout", function(data) {
        toolTip.hide(data);

    });

    return circlesGroup;

}

d3.csv("assets/data/data.csv").then(function(censusdata) {
    
    // Parse data
    censusdata.forEach(function(data) {
        data.id = +data.id;
        data.state = data.state;
        data.abbr = data.abbr;
        data.poverty = +parseFloat(data.poverty);
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = +data.incomeMoe;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
        console.log(data.abbr);
    });
    
    //console.log(data.abbr);
    
    let xLinearScale = XScale(censusdata, chosenXAxis);
    let yLinearScale = YScale(censusdata, chosenYAxis);

    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append X Axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // Append Y Axis
    let yAxis = chartGroup.append("g")
        .call(leftAxis);
        console.log(chartGroup)
    // Append Initial Circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(censusdata)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        //.attr("class", d=> "stateCircle " + d.abbr)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20);

    console.log(chartGroup);
        //.text(d=>(d.abbr));
        console.log(censusdata);
        //console.log(chosenXAxis);
        //console.log(chosenYAxis);

    // Append State Abbreviations to the circles#################
    let circleText = chartGroup.selectAll("circle text")
        .data(censusdata)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d=>{console.log(d.abbr); return d.abbr});


    console.log(circleText);
   

    // Create axis labels
    let xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    let povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active atext", true)
        .text("In Poverty (%)");

    let ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive atext", true)
        .text("Age (median)");

    let incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive atext", true)
        .text("Household Income (median)");
        
    let yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    let obesityLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - 30)
        .attr("value", "obesity")
        .classed("active atext", true)
        .text("Obese (%)");

    let smokeLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - 50)
        .attr("value", "smokes")
        .classed("inactive atext", true)
        .text("Smokes (%)");

    let healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - 70)
        .attr("value", "healthcare")
        .classed("inactive atext", true)
        .text("Lacks Healthcare (%)");

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText);

    xLabelsGroup.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = XScale(censusdata, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circleText = renderText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText);
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    incomeLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
                else {
                    povertyLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    yLabelsGroup.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                chosenYAxis = value;
                yLinearScale = YScale(censusdata, chosenYAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circleText = renderText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText);
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
                else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
                else {
                    obesityLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    smokeLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

}).catch(function(error) {
    console.log(error);
});