<script>
    import {
        select,
        scaleTime,
        extent,
        scaleLinear,
        line,
        axisBottom,
        axisLeft,
    } from "d3";
    import { onMount } from "svelte";

    let { data } = $props();

    const logs = JSON.parse(data.logs).all.reverse();
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
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = window.innerWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = scaleTime()
            .domain(extent(stats.total.linesOfCode, (d) => new Date(d.date)))
            .range([0, width]);

        const yScale = scaleLinear()
            .domain(extent(stats.total.linesOfCode, (d) => d.linesOfCode))
            .range([height, 0]);

        const lineGenerator = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.linesOfCode));

        svg.append("path")
            .datum(stats.total.linesOfCode)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

        // Add the X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(axisBottom(xScale));

        // Add the Y Axis
        svg.append("g").call(axisLeft(yScale));
    });
</script>

<div id="chart"></div>

<p>{JSON.stringify(stats)}</p>
{#each logs as log}
    <p>{JSON.stringify(log)}</p>
{/each}
