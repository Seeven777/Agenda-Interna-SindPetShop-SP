import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
class ErrorBoundary extends Component {
    state = {
        hasError: false
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "h-screen w-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 mb-4", children: "Something went wrong" }), _jsx("p", { className: "text-slate-500 mb-8", children: "The application encountered an unexpected error." }), _jsx("button", { className: "bg-blue-600 text-white px-6 py-3 rounded-xl font-bold", onClick: () => window.location.reload(), children: "Reload Application" }), this.state.error && (_jsx("pre", { className: "mt-8 p-4 bg-slate-200 rounded-lg text-xs text-left max-w-full overflow-auto", children: this.state.error.message }))] }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
