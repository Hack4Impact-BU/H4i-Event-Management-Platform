import React, { useState } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Finances from "./pages/finances/finances";
import "./App.css";

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(() => {
		return !!sessionStorage.getItem("authToken");
	});

	const [userEmail, setUserEmail] = useState("");


	function ErrorBoundary() {
		const localLink = window.location.href.substring(
			window.location.href.lastIndexOf("/")
		);
		return (
			<>
				<h1 style={{ textAlign: "center", marginTop: "5rem" }}>
					Error 404: Page Not Found
				</h1>
				<h2 style={{ textAlign: "center", marginBottom: "5rem" }}>
					The requested URL {localLink} was not found on this server.
				</h2>
			</>
		);
	}

	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						isAuthenticated ? (
							<Navigate to={`/home?email=${encodeURIComponent(userEmail)}`} replace />
						) : (
							<Login setIsAuthenticated={setIsAuthenticated} setUserEmail={setUserEmail} />
						)
					}
				/>
				<Route
					path="/home"
					element={
						isAuthenticated ? <Home /> : <Navigate to="/" replace />
					}
				/>
				<Route
					path="/finances"
					element={
						isAuthenticated ? (
							<Finances />
						) : (
							<Navigate to="/" replace />
						)
					}
				/>
				<Route path="*" element={<ErrorBoundary />} />
			</Routes>
		</Router>
	);
}

export default App;
