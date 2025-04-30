import React, { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import "./PieChart.css";


const Piechart = (semester) => {
    const [events,setEvents] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagColors, setTagColors] = useState({});
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);


    useEffect(() => {
        fetchEvents().then(data => sortEvents(data)).then(events => populateChart(events));
        fetchTags();
    }, [semester.onTableChange]);

    const fetchEvents = async () => {
        try {
            const response = await fetch('https://h4i-event-management-platform-production.up.railway.app/events');
            if (!response.ok) {
            throw new Error('Failed to fetch events');
            }
            const data = await response.json();
    
            return data;
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('https://h4i-event-management-platform-production.up.railway.app/tags');
            if (!response.ok) {
            throw new Error('Failed to fetch tags');
            }
            const data = await response.json();

            const tags = [];
            const tagColors = {};

            data.forEach(tag => {
                tags.push(tag.name);
                tagColors[tag.name] = tag.color;
            });

            setTags(tags);
            setTagColors(tagColors);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const sortEvents = (data) => {
        let temp = data;
        const today = new Date();

        temp.sort((a, b) => new Date(b.date) - new Date(a.date))
        temp = temp.filter((event) => new Date(event.date) <= today);

        temp = temp.filter((event) =>  event.semesterName === semester.semester?.name);

        setEvents(temp);
        return temp;
    }

    const populateChart = (events) => {
        const values = {
            "general": 0,
            "speaker event": 0,
            "workshop": 0,
            "social": 0,
            "tbd": 0,
            "power": 0,
            "test": 0,
        };

        // init value of each tag
        let total = 0;
        events.map((event) => {
            total = total + event.budget.actual;
            values[event.tag] += event.budget.actual;
        });
        setTotal(total);

        // Filter out keys with value 0
        const nonZeroData = Object.entries(values)
            .filter(([key, value]) => value !== 0)
            .map(([key, value]) => ({ value: value, label: key }));

        setData(nonZeroData);
    }

    return (
        <PieChart
            id="pie_chart"
            height={300}
            slotProps={{ legend: { hidden: true } }}
            series={[
                {
                    data: data,
                    innerRadius: "75px",
                    arcLabel: (params) => params.label ?? '',
                    startAngle: 0,
                    endAngle: 360,
                },
            ]}
        />
    )
}

export default Piechart;