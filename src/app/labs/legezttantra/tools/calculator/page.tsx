'use client';

import { useState } from 'react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function CalculatorPage() {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleNumber = (num: string) => {
        setDisplay(prev => prev === '0' ? num : prev + num);
        setEquation(prev => prev + num);
    };

    const handleOperator = (op: string) => {
        setDisplay('0');
        setEquation(prev => prev + ' ' + op + ' ');
    };

    const calculate = () => {
        try {
            // Standard eval caution: only running on client side input from buttons
            // In production, build a proper parser. For "sachme bana do" quick tool, eval is functional.
            // Replacing 'x' with '*' for JS eval
            const safeEquation = equation.replace(/x/g, '*').replace(/÷/g, '/');
            const result = eval(safeEquation);
            setDisplay(String(result));
            setEquation(String(result));
        } catch (e) {
            setDisplay('Error');
            setEquation('');
        }
    };

    const clear = () => {
        setDisplay('0');
        setEquation('');
    };

    const buttons = [
        { label: 'C', type: 'special', action: clear },
        { label: '(', type: 'special', action: () => handleNumber('(') },
        { label: ')', type: 'special', action: () => handleNumber(')') },
        { label: '÷', type: 'operator', action: () => handleOperator('÷') },
        { label: '7', type: 'number', action: () => handleNumber('7') },
        { label: '8', type: 'number', action: () => handleNumber('8') },
        { label: '9', type: 'number', action: () => handleNumber('9') },
        { label: 'x', type: 'operator', action: () => handleOperator('x') },
        { label: '4', type: 'number', action: () => handleNumber('4') },
        { label: '5', type: 'number', action: () => handleNumber('5') },
        { label: '6', type: 'number', action: () => handleNumber('6') },
        { label: '-', type: 'operator', action: () => handleOperator('-') },
        { label: '1', type: 'number', action: () => handleNumber('1') },
        { label: '2', type: 'number', action: () => handleNumber('2') },
        { label: '3', type: 'number', action: () => handleNumber('3') },
        { label: '+', type: 'operator', action: () => handleOperator('+') },
        { label: '0', type: 'number', action: () => handleNumber('0') },
        { label: '.', type: 'number', action: () => handleNumber('.') },
        { label: '=', type: 'equal', action: calculate, span: 2 },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
            <LeGeZtHeader />

            <main className="flex-1 pt-32 px-4 flex justify-center items-start">
                <div className="bg-[#2c3e50] p-6 rounded-2xl shadow-2xl w-full max-w-sm">
                    {/* Display Screen */}
                    <div className="bg-[#ecf0f1] rounded-lg mb-6 p-4 text-right flex flex-col justify-end h-24 shadow-inner">
                        <div className="text-slate-500 text-sm h-6 overflow-hidden">{equation}</div>
                        <div className="text-3xl font-bold text-slate-800 truncate">{display}</div>
                    </div>

                    {/* Buttons Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {buttons.map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={btn.action}
                                className={`
                                    h-14 rounded-lg font-bold text-lg hover:brightness-110 active:scale-95 transition-all
                                    ${btn.span ? `col-span-${btn.span}` : ''}
                                    ${btn.type === 'number' ? 'bg-white text-slate-700 shadow-[0_2px_0_#cbd5e1]' : ''}
                                    ${btn.type === 'operator' ? 'bg-[#f39c12] text-white shadow-[0_2px_0_#d35400]' : ''}
                                    ${btn.type === 'special' ? 'bg-[#95a5a6] text-white shadow-[0_2px_0_#7f8c8d]' : ''}
                                    ${btn.type === 'equal' ? 'bg-[#2ecc71] text-white shadow-[0_2px_0_#27ae60] w-full' : ''}
                                `}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
