// frontend/src/pages/ExportPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button, Select, Typography, message, Spin, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const API_URL = 'http://localhost:5000/api/export';

const ExportPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  const handleExport = async () => {
    if (!selectedDistribution) {
      message.warn('Por favor, selecione uma distribuição para exportar.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/fet`,
        { distributionId: selectedDistribution },
        { responseType: 'blob' } // MUITO IMPORTANTE: para receber o arquivo
      );

      // Cria um link temporário na memória para iniciar o download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `horario_${selectedDistribution}.fet`);
      document.body.appendChild(link);
      link.click();
      
      // Limpa o link da memória
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Arquivo .fet gerado com sucesso!');

    } catch (error) {
      message.error('Falha ao gerar o arquivo .fet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Exportar Dados para o FET</Title>
      <Paragraph>
        Esta página permite ao administrador gerar o arquivo final `.fet` com base em todos os dados
        cadastrados e aprovados no sistema para uma distribuição específica.
      </Paragraph>

      <Space direction="vertical" size="large" style={{ marginTop: 24 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Selecione a Distribuição"
          onChange={(value) => setSelectedDistribution(value)}
        >
            {/* No futuro, essa lista viria da API */}
            <Option value="2025.2-TGC">2025.2 - Gestão Comercial</Option>
            <Option value="2025.2-EECM">2025.2 - Ensino de Ciências e Matemática</Option>
        </Select>

        <Spin spinning={loading} tip="Gerando arquivo... Isso pode levar alguns segundos.">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={handleExport}
            disabled={!selectedDistribution}
          >
            Exportar Arquivo .FET
          </Button>
        </Spin>
      </Space>
    </div>
  );
};

export default ExportPage;