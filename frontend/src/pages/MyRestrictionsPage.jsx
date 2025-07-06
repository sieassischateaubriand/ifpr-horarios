// frontend/src/pages/MyRestrictionsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Tag, message, Spin, Input, Space } from 'antd';
import './MyRestrictionsPage.css'; // Criaremos este arquivo para os estilos

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Dados fixos para a grade. No futuro, podem vir de uma API de "Configurações".
const DIAS = ["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"];
const HORARIOS = [
  "07:30-08:20", "08:20-09:10", "09:25-10:15", "10:15-11:05", "11:05-11:55",
  "13:10-14:00", "14:00-14:50", "15:05-15:55", "15:55-16:45",
  "19:00-19:50", "19:50-20:40", "20:55-21:45", "21:45-22:35"
];

const API_URL = 'http://localhost:5000/api/restrictions';

// Simulação de dados do usuário logado e da distribuição ativa
const MOCK_TEACHER_ID = '60f...'; // Substitua por um ID de professor real do seu DB
const MOCK_DISTRIBUTION_ID = '2025.2-TGC'; // A mesma que usamos na tela de distribuição

const MyRestrictionsPage = () => {
  const [restrictions, setRestrictions] = useState({});
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState('Rascunho');
  const [loading, setLoading] = useState(false);

  // Inicializa o mapa de restrições
  const initializeRestrictions = () => {
    const initialMap = {};
    DIAS.forEach(dia => {
      initialMap[dia] = {};
      HORARIOS.forEach(hora => {
        initialMap[dia][hora] = 'Livre';
      });
    });
    return initialMap;
  };

  useEffect(() => {
    const fetchRestrictions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/by-teacher/${MOCK_TEACHER_ID}/${MOCK_DISTRIBUTION_ID}`);
        const { slots, status, observations } = response.data;
        
        const newRestrictions = initializeRestrictions();
        if (slots) {
          slots.forEach(slot => {
            if (newRestrictions[slot.day]) {
              newRestrictions[slot.day][slot.hour] = slot.restrictionType;
            }
          });
        }
        setRestrictions(newRestrictions);
        setStatus(status || 'Rascunho');
        setObservations(observations || '');

      } catch (error) {
        message.error('Erro ao carregar suas restrições.');
        setRestrictions(initializeRestrictions());
      }
      setLoading(false);
    };
    fetchRestrictions();
  }, []);

  const handleSlotClick = (dia, hora) => {
    if (status !== 'Rascunho' && status !== 'Requer Ajustes') {
        message.info('Você não pode editar uma restrição que já foi enviada ou aprovada.');
        return;
    }

    const currentType = restrictions[dia][hora];
    let nextType;
    if (currentType === 'Livre') nextType = 'Limitado';
    else if (currentType === 'Limitado') nextType = 'Bloqueado';
    else nextType = 'Livre';

    setRestrictions(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [hora]: nextType,
      },
    }));
  };
  
  const handleSave = async (newStatus) => {
    setLoading(true);
    // Transforma o mapa de volta para o formato de array que a API espera
    const slotsToSave = [];
    Object.keys(restrictions).forEach(dia => {
      Object.keys(restrictions[dia]).forEach(hora => {
        const type = restrictions[dia][hora];
        if (type !== 'Livre') {
          slotsToSave.push({ day: dia, hour: hora, restrictionType: type });
        }
      });
    });

    try {
        const payload = {
            teacher: MOCK_TEACHER_ID,
            distributionId: MOCK_DISTRIBUTION_ID,
            status: newStatus,
            slots: slotsToSave,
            observations: observations
        };
        await axios.post(API_URL, payload);
        setStatus(newStatus);
        message.success(`Restrições salvas como '${newStatus}'!`);
    } catch(error) {
        message.error('Falha ao salvar restrições.');
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Minhas Restrições de Horário</Title>
      <Paragraph>Distribuição: <Text strong>{MOCK_DISTRIBUTION_ID}</Text></Paragraph>
      <Paragraph>Status: <Tag color={status === 'Aprovado' ? 'green' : 'blue'}>{status}</Tag></Paragraph>
      <Spin spinning={loading}>
        <div className="restrictions-grid-container">
          <table className="restrictions-table">
            <thead>
              <tr>
                <th>Horário</th>
                {DIAS.map(dia => <th key={dia}>{dia}</th>)}
              </tr>
            </thead>
            <tbody>
              {HORARIOS.map(hora => (
                <tr key={hora}>
                  <td>{hora}</td>
                  {DIAS.map(dia => (
                    <td
                      key={`${dia}-${hora}`}
                      className={`slot ${restrictions[dia]?.[hora]?.toLowerCase()}`}
                      onClick={() => handleSlotClick(dia, hora)}
                    >
                      {restrictions[dia]?.[hora]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: 24 }}>
            <Title level={4}>Observações / Justificativas</Title>
            <Paragraph type="secondary">Use este campo para justificar os horários bloqueados (ex: função de gestão, pós-graduação, etc.), conforme o edital.</Paragraph>
            <TextArea 
                rows={4} 
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                disabled={status !== 'Rascunho' && status !== 'Requer Ajustes'}
            />
        </div>
        
        <Space style={{ marginTop: 24 }}>
            <Button onClick={() => handleSave('Rascunho')} disabled={status !== 'Rascunho' && status !== 'Requer Ajustes'}>
                Salvar Rascunho
            </Button>
            <Button type="primary" onClick={() => handleSave('Aguardando Revisão')} disabled={status !== 'Rascunho' && status !== 'Requer Ajustes'}>
                Enviar para Aprovação
            </Button>
        </Space>
      </Spin>
    </div>
  );
};

export default MyRestrictionsPage;