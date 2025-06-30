import { Modal, Input, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import PhysicalRentalAbi from "@/constants/PhysicalRental.json"
import { ethers } from "ethers"
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ToolActionModal({ status, role, onComplete }){
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null); // 'buena' o 'mala'
  const [attempts, setAttempts] = useState(0);
  const [resultsHistory, setResultsHistory] = useState([]);

  useEffect(() => {
    simulateAnalysis();
  }, []);

  const simulateAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const isBuena = Math.random() < 0.7;
      const analysis = isBuena ? 'buena' : 'mala';
      setResult(analysis);
      setResultsHistory((prev) => [...prev, analysis]);
      setAttempts((prev) => prev + 1);
      setLoading(false);
    }, 2000);
  };

  const handleRetry = () => {
    simulateAnalysis();
  };

  const handleProceed = () => {
    const countBuena = resultsHistory.filter((r) => r === 'buena').length;
    const countMala = resultsHistory.filter((r) => r === 'mala').length;
    const finalResult = countBuena >= countMala ? 'buena' : 'mala';
    onComplete(finalResult);
  };

  const showRetry = result === 'mala' && attempts < 3;

  const canProceed = () => {
    if (role === 'owner' && status === 'Send' && result === 'mala' && attempts >= 3) {
      return false;
    }
    return result === 'buena' || (attempts >= 3 || (role === 'renter' || status === 'Receive'));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-md mx-auto mt-20 text-center space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Acción: {status}</h2>
      <p className="text-gray-600">Rol: {role === 'owner' ? 'Propietario' : 'Arrendatario'}</p>

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          <p>Analizando herramienta...</p>
        </div>
      ) : (
        <>
          <p className={`text-lg font-semibold ${result === 'buena' ? 'text-green-600' : 'text-red-600'}`}>
            Resultado del análisis: {result?.toUpperCase()}
          </p>

          {showRetry && (
            <button
              onClick={handleRetry}
              className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-white"
            >
              Intentar otra vez ({3 - attempts} intentos restantes)
            </button>
          )}

          {canProceed() && (
            <button
              onClick={handleProceed}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
            >
              Continuar con la acción
            </button>
          )}

          {!canProceed() && !showRetry && (
            <p className="text-sm text-red-500">
              No se puede continuar con la acción debido al mal estado de la herramienta.
            </p>
          )}
        </>
      )}
    </div>
  );
};




async function registryInspect(){
    // desde el cliente
    await fetch('/api/create-tool', {
        method: 'POST',
        body: JSON.stringify({
            tool_id: 101,
            condition: "buena",
            status: "activa",
            send: "2025-06-25T10:00:00Z",
            receive: "2025-06-25T16:00:00Z"
        }),
        headers: { 'Content-Type': 'application/json' }
    })
}