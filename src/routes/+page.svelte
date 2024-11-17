<script>
    import {
        select,
        scaleTime,
        extent,
        scaleLinear,
        line,
        axisBottom,
        axisRight,
        axisLeft,
    } from "d3";
    import { onMount } from "svelte";
    import BarChart from "./BarChart.svelte";

    let { data } = $props();

    const logs = JSON.parse(
        data.logs.replaceAll(
            "139547552+PoisChiche4390@users.noreply.github.com",
            "mx.konovets@gmail.com",
        ),
    ).all.reverse();
    let stats = {
        total: {
            commits: 0,
            linesAdded: 0,
            linesDeleted: 0,
            contributors: 0,
            linesOfCode: [],
        },
    };

    let today = new Date();
    let currentDate = new Date(logs[0].date);
    while (
        new Date(currentDate.toDateString()).getTime() <=
        new Date(today.toDateString()).getTime()
    ) {
        stats.total.linesOfCode[stats.total.linesOfCode.length] = {
            date: currentDate.toDateString(),
            linesOfCode: 0,
        };
        currentDate.setDate(currentDate.getDate() + 1);
    }

    logs.forEach((log) => {
        if (!stats[log.author_email]) {
            stats[log.author_email] = {
                commits: 0,
                linesAdded: 0,
                linesDeleted: 0,
            };
            stats.total.contributors += 1;
        }

        stats[log.author_email].commits += 1;
        stats[log.author_email].linesAdded += log.insertions ?? 0;
        stats[log.author_email].linesDeleted += log.deletions ?? 0;

        stats.total.commits += 1;
        stats.total.linesAdded += log.insertions ?? 0;
        stats.total.linesDeleted += log.deletions ?? 0;
        stats.total.linesOfCode.forEach((stat) => {
            if (new Date(stat.date).getTime() >= new Date(log.date).getTime())
                stat.linesOfCode +=
                    (log.insertions ?? 0) - (log.deletions ?? 0);
        });
    });

    onMount(() => {
        const margin = { top: 20, right: 40, bottom: 40, left: 60 };
        const width = window.innerWidth - margin.left - margin.right - 40; // Added padding
        const height = 400 - margin.top - margin.bottom; // Increased height

        const svg = select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add gradient background
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "rgba(255, 255, 255, 0.03)")
            .attr("rx", 8); // Rounded corners

        const xScale = scaleTime()
            .domain(extent(stats.total.linesOfCode, (d) => new Date(d.date)))
            .range([0, width]);

        const yScale = scaleLinear()
            .domain([
                0,
                Math.max(...stats.total.linesOfCode.map((d) => d.linesOfCode)),
            ])
            .range([height, 0]);

        // Add grid lines
        svg.append("g")
            .attr("class", "grid")
            .attr("opacity", 0.1)
            .call(axisLeft(yScale).tickSize(-width).tickFormat(""));

        const lineGenerator = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.linesOfCode));

        // Add gradient for the line
        const gradient = svg
            .append("defs")
            .append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0)
            .attr("y1", yScale(0))
            .attr("x2", 0)
            .attr(
                "y2",
                yScale(
                    Math.max(
                        ...stats.total.linesOfCode.map((d) => d.linesOfCode),
                    ),
                ),
            );

        gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#4CAF50");

        gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#81C784");

        // Add area under the line
        svg.append("path")
            .datum(stats.total.linesOfCode)
            .attr("fill", "url(#line-gradient)")
            .attr("fill-opacity", 0.1)
            .attr(
                "d",
                line()
                    .x((d) => xScale(new Date(d.date)))
                    .y((d) => yScale(d.linesOfCode)),
            );

        // Add the line with animation
        const path = svg
            .append("path")
            .datum(stats.total.linesOfCode)
            .attr("fill", "none")
            .attr("stroke", "url(#line-gradient)")
            .attr("stroke-width", 3)
            .attr("d", lineGenerator);

        const totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);

        // Style axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("class", "axis")
            .call(
                axisBottom(xScale)
                    .ticks(5)
                    .tickFormat((d) => d.toLocaleDateString()),
            );

        svg.append("g").attr("class", "axis").call(axisLeft(yScale));

        // Style axis lines and text
        svg.selectAll(".axis path").style("stroke", "#666");
        svg.selectAll(".axis line").style("stroke", "#666");
        svg.selectAll(".axis text")
            .style("fill", "#888")
            .style("font-size", "12px");
    });
</script>

<div
    class="flex flex-col gap-8 mt-8 w-full bg-gray-900 min-h-screen text-gray-100"
>
    <div class="flex flex-col px-8 py-6 bg-gray-800 shadow-lg">
        <h1
            class="text-6xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
        >
            Assimly
        </h1>
        <div class="mt-6 gap-6 flex flex-wrap">
            <div class="stat-card">
                <span class="stat-label">Contributors</span>
                <span class="stat-value">{stats.total.contributors}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Total Commits</span>
                <span class="stat-value">{stats.total.commits}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Lines Added</span>
                <span class="stat-value text-green-400"
                    >+{stats.total.linesAdded}</span
                >
            </div>
            <div class="stat-card">
                <span class="stat-label">Lines Deleted</span>
                <span class="stat-value text-red-400"
                    >-{stats.total.linesDeleted}</span
                >
            </div>
        </div>
    </div>

    <div class="px-8">
        <h2 class="text-2xl font-bold mb-4">Lines of Code Evolution</h2>
        <div id="chart" class="bg-gray-800 p-4 rounded-lg shadow-lg"></div>
    </div>

    <div class="px-8 pb-8">
        <h2 class="text-2xl font-bold mb-6">Contributor Statistics</h2>
        <div class="flex flex-col gap-6">
            <div class="stat-section">
                <h3 class="text-xl mb-3">Commits per Contributor</h3>
                <BarChart
                    data={Object.entries(stats)
                        .filter((x) => x[0] != "total")
                        .map((x) => ({
                            label: x[0],
                            value: x[1].commits,
                        }))}
                />
            </div>

            <div class="stat-section">
                <h3 class="text-xl mb-3">Lines Added per Contributor</h3>
                <BarChart
                    data={Object.entries(stats)
                        .filter((x) => x[0] != "total")
                        .map((x) => ({
                            label: x[0],
                            value: x[1].linesAdded,
                        }))}
                />
            </div>

            <div class="stat-section">
                <h3 class="text-xl mb-3">Lines Deleted per Contributor</h3>
                <BarChart
                    data={Object.entries(stats)
                        .filter((x) => x[0] != "total")
                        .map((x) => ({
                            label: x[0],
                            value: x[1].linesDeleted,
                        }))}
                />
            </div>
        </div>
    </div>
</div>

<style>
    :global(body) {
        background-color: #111827;
        color: #f3f4f6;
        margin: 0;
        padding: 0;
    }

    .stat-card {
        @apply bg-gray-700 rounded-lg p-4 flex flex-col gap-2 min-w-[200px];
    }

    .stat-label {
        @apply text-gray-400 text-sm font-medium;
    }

    .stat-value {
        @apply text-2xl font-bold;
    }

    .stat-section {
        @apply bg-gray-800 rounded-lg p-6 shadow-lg;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
</style>
