import React, { useState, useEffect, useRef } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import NavBar from "../../components/navbar/Navbar";
import FinanceTable from "../../components/financeTable/financeTable";
import "./finances.css";

export default function Finances() {
	return (
		<>
			<div>
				<NavBar />
			</div>
			<div className="finance_information_container">
			<PieChart
				height={300}
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
					arcLabelMinAngle: 20,
				},
				]}
			/>
				<FinanceTable />
			</div>
		</>	
	);
}
