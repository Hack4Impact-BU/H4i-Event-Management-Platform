import React, { useState } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import "./FinanceTable.css";

function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const FinanceTable = () => {
    
    return (
        <div className="finance_table_container">
            <Table aria-label="finance table">
                <TableHead>
                    <TableRow>
                        <TableCell>Event Name</TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell align="center">Event Date</TableCell>
                        <TableCell align="center">Total Expenses</TableCell>
                        <TableCell align="center">Attendance</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row) => (
                    <TableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell component="th" scope="row">
                        {row.name}
                    </TableCell>
                    <TableCell align="center">{row.calories}</TableCell>
                    <TableCell align="center">{row.fat}</TableCell>
                    <TableCell align="center">${row.carbs}</TableCell>
                    <TableCell align="center">{row.protein}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default FinanceTable;