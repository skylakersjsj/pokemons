// Load CSV data
d3.csv(".Pokemons.csv").then(function(data) {
    const headers = Object.keys(data[0]);
    
    // Populate dropdown with headers from CSV
    headers.forEach(header => {
        d3.select("#variablesDropdown")
            .append("option")
            .attr("value", header)
            .text(header);
    });

    d3.select("#variablesDropdown").on("change", function() {
        const selectedVariable = this.value;
        // Clear previous chart
        d3.select("#chart").html("");

        // Check if selected variable is categorical or numerical
        if (["Type", "Legendary", "Mega Evolution", "Generation"].includes(selectedVariable)) {
            drawBarChart(data, selectedVariable);
        } else {
            drawPieChart(data, selectedVariable);
        }
    });
});

function drawBarChart(data, variable) {
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let counts = {};
    data.forEach(d => {
        counts[d[variable]] = (counts[d[variable]] || 0) + 1;
    });

    const entries = Object.entries(counts);

    x.domain(entries.map(d => d[0]));
    y.domain([0, d3.max(entries, d => d[1])]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".bar")
        .data(entries)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[1]));
}


function drawPieChart(data, variable) {
    const width = 960;
    const height = 500;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    const pie = d3.pie()
        .sort(null)
        .value(d => d[1]);

    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let counts = {};
    data.forEach(d => {
        counts[d[variable]] = (counts[d[variable]] || 0) + 1;
    });

    const entries = Object.entries(counts);

    const g = svg.selectAll(".arc")
        .data(pie(entries))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data[0]));

    g.append("text")
        .attr("transform", d => "translate(" + arc.centroid(d) + ")")
        .attr("dy", ".35em")
        .text(d => d.data[0]);
}
