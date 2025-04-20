import React, { useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import "./PieChart.css";


const Piechart = (budget) => {
    if (budget <= 0) {
        budget = 360;
    }

    return (
        <PieChart
            id="pie_chart"
            height={300}
            slotProps={{ legend: { hidden: true } }}
            series={[
                {
                    data: [
                        { value: 15, label: 'A' },
                        { value: 30, label: 'B' },
                        { value: 10, label: 'C' },
                        { value: 60, label: 'D' },
                    ],
                    innerRadius: "75px",
                    arcLabel: (params) => params.label ?? '',
                    startAngle: 0,

                    endAngle: budget,
                },
            ]}
        />
    )
}

export default Piechart;