<!-- HorizontalBarChart.svelte -->
<script>
    import * as d3 from "d3";
    import { onMount } from "svelte";
    export let data = [
        { label: "A", value: 10 },
        { label: "B", value: 20 },
        { label: "C", value: 15 },
        { label: "D", value: 25 },
    ];
    let width = 500;
    let height = 300;
    let marginTop = 20;
    let marginRight = 150;
    let marginBottom = 40;
    let marginLeft = 120;
    let svg;

    onMount(() => {
        width = document.body.clientWidth;
        let innerWidth = width - marginLeft - marginRight;
        let innerHeight = height - marginTop - marginBottom;

        let yScale = d3
            .scaleBand()
            .domain(data.map((d) => d.label))
            .range([0, innerHeight])
            .padding(0.1);

        let xScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)])
            .range([0, innerWidth]);

        const svgElement = d3.select(svg);

        // Create tooltip div
        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("padding", "5px")
            .style("border-radius", "3px")
            .style("font-size", "12px");

        // Create axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Add x-axis
        svgElement
            .append("g")
            .attr(
                "transform",
                `translate(${marginLeft}, ${height - marginBottom})`,
            )
            .call(xAxis);

        // Add y-axis
        svgElement
            .append("g")
            .attr("transform", `translate(${marginLeft}, ${marginTop})`)
            .call(yAxis);

        // Update function for bars
        function updateBars() {
            const bars = svgElement
                .select(".bars")
                .selectAll("rect")
                .data(data);

            // Remove old bars
            bars.exit().remove();

            // Add new bars with hover interactions
            bars.enter()
                .append("rect")
                .merge(bars)
                .transition()
                .duration(500)
                .attr("x", 0)
                .attr("y", (d) => yScale(d.label))
                .attr("width", (d) => xScale(d.value))
                .attr("height", yScale.bandwidth())
                .attr("fill", "steelblue")
                .selection() // End transition and get selection
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("fill", "#4682b4cc"); // Lighter blue on hover

                    tooltip
                        .style("visibility", "visible")
                        .style("color", "black")
                        .text(`Value: ${d.value}`);
                })
                .on("mousemove", function (event) {
                    tooltip
                        .style("top", event.pageY - 10 + "px")
                        .style("left", event.pageX + 10 + "px");
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("fill", "steelblue");

                    tooltip.style("visibility", "hidden");
                });
        }

        // Initial render
        updateBars();

        // Cleanup function to remove tooltip when component is destroyed
        return () => {
            tooltip.remove();
        };
    });
</script>

<svg bind:this={svg} {width} {height}>
    <g class="bars" transform="translate({marginLeft}, {marginTop})" />
</svg>
