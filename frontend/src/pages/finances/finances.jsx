import React, { useState, useEffect, useRef } from 'react';
import NavBar from "../../components/navbar/Navbar";
import FinanceTable from "../../components/financeTable/financeTable";
import Piechart from "../../components/pieChart/PieChart";
import "./finances.css";

export default function Finances() {
	return (
		<>
			<div>
				<NavBar />
			</div>
			<div className="finance_information_container">
				<Piechart />
				<FinanceTable />
			</div>
		</>
	);
}
