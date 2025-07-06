// frontend/src/pages/ManageRestrictionsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Typography, Tag, message, Spin, Select, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './MyRestrictionsPage.css'; // Reutilizaremos o mesmo CSS da tela do professor

const { Title, Text } = Typography;
const { Option } = Select;

// Dados fixos (iguais aos da tela do professor)
const DIAS = ["Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira"];
const HORARIOS = [
  "07:30-08:20", "08:20-09:10", "09:25-10:15", "10:15-11:05", "11:05-11:55",
  "13:10-14:00", "14:00-14:50", "15:05-15:55", "15:55-16:45",
  "19:00-19:50", "19:50-20:40", "20:55-21:45", "21:45-22:35"
];

const API_URL = 'http://localhost:5000/api/restrictions';

// Simulação da distribuição ativa (o coordenador selecionaria isso)
const MOCK_DISTRIBUTION_ID = '2025.2-TGC';

const ManageRestrictionsPage = () => {
  const [restrictions, setRestrictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRestriction, setSelectedRestriction] = useState(null);
  const [modalGrid, setModalGrid] = useState({});

  const fetchRestrictions = async () => {
    if (!MOCK_DISTRIBUTION_ID) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/by-distribution/${MOCK_DISTRIBUTION_ID}`);
      setRestrictions(response.data);
    } catch (error) {
      message.error('Falha ao carregar as solicitações de restrição.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestrictions();
  }, []);

  const handleStatusChange = async (restrictionId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/${restrictionId}/status`, { status: newStatus });
      message.success('Status da restrição atualizado!');
      fetchRestrictions(); // Recarrega a lista para refletir a mudança
    } catch (error) {
      message.error('Falha ao atualizar o status.');
    }
  };
  
  const showDetailsModal = (record) => {
    setSelectedRestriction(record);
    
    // Constrói a grade de horários para o modal a partir dos dados do 'record'
    const grid = {};
    DIAS.forEach(dia => {
      grid[dia] = {};
      HORARIOS.forEach(hora => grid[dia][hora] = 'Livre');
    });
    record.slots.forEach(slot => {
      if(grid[slot.day]) {
        grid[slot.day][slot.hour] = slot.restrictionType;
      }
    });
    setModalGrid(grid);
    setIsModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Aguardando Revisão': return 'orange';
      case 'Aprovado': return 'green';
      case 'Requer Ajustes': return 'red';
      case 'Rascunho': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Professor',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacher) => teacher?.name || 'Não identificado',
      sorter: (a, b) => a.teacher.name.localeCompare(b.teacher.name),
    },
    {
      title: 'Data de Envio',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDetailsModal(record)}>
            Analisar
          </Button>
          <Select 
            value={record.status} 
            style={{ width: 150 }} 
            onChange={(newStatus) => handleStatusChange(record._id, newStatus)}
          >
            <Option value="Aguardando Revisão">Aguardando Revisão</Option>
            <Option value="Aprovado">Aprovado</Option>
            <Option value="Requer Ajustes">Requer Ajustes</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Gerenciar Restrições dos Professores</Title>
      <Title level={4} type="secondary">Distribuição: {MOCK_DISTRIBUTION_ID}</Title>
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={restrictions}
          rowKey="_id"
          bordered
        />
      </Spin>

      <Modal
        title={`Detalhes da Restrição - ${selectedRestriction?.teacher?.name}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Fechar
          </Button>,
        ]}
        width={1000}
      >
        {selectedRestriction && (
          <>
            <Title level={5}>Observações do Docente:</Title>
            <Text type="secondary">{selectedRestriction.observations || "Nenhuma observação fornecida."}</Text>
            <div className="restrictions-grid-container" style={{ marginTop: 24 }}>
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
                        <td key={`${dia}-${hora}`} className={`slot ${modalGrid[dia]?.[hora]?.toLowerCase()}`}>
                          {modalGrid[dia]?.[hora]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ManageRestrictionsPage;