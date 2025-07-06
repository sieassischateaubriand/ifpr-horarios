c// frontend/src/pages/CoursePage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  Space,
  Popconfirm,
  message,
  Typography
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const API_URL = 'http://localhost:5000/api/courses'; // URL do nosso backend

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  // Função para buscar os cursos do backend
  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL);
      setCourses(response.data);
    } catch (error) {
      message.error('Falha ao carregar os cursos.');
      console.error(error);
    }
  };

  // useEffect para carregar os cursos quando o componente montar
  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCourse(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success('Curso deletado com sucesso!');
      fetchCourses(); // Recarrega a lista
    } catch (error) {
      message.error('Falha ao deletar o curso.');
    }
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Função chamada quando o formulário é submetido com sucesso
  const onFinish = async (values) => {
    try {
      if (editingCourse) {
        // Atualizando um curso existente
        await axios.put(`${API_URL}/${editingCourse._id}`, values);
        message.success('Curso atualizado com sucesso!');
      } else {
        // Criando um novo curso
        await axios.post(API_URL, values);
        message.success('Curso criado com sucesso!');
      }
      setIsModalVisible(false);
      fetchCourses(); // Recarrega a lista de cursos
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Falha ao salvar o curso.';
      message.error(errorMessage);
    }
  };

  // Definição das colunas da tabela
  const columns = [
    { title: 'Nome do Curso', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Sigla', dataIndex: 'sigla', key: 'sigla' },
    { title: 'Eixo', dataIndex: 'eixo', key: 'eixo' },
    { title: 'Modalidade', dataIndex: 'modalidadeOferta', key: 'modalidadeOferta' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Editar</Button>
          <Popconfirm
            title="Tem certeza que deseja deletar este curso?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger icon={<DeleteOutlined />}>Deletar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Cadastro de Cursos</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
      >
        Adicionar Curso
      </Button>
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="_id"
        bordered
      />

      <Modal
        title={editingCourse ? 'Editar Curso' : 'Adicionar Novo Curso'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" name="course_form" onFinish={onFinish}>
          <Form.Item name="name" label="Nome do Curso" rules={[{ required: true, message: 'Por favor, insira o nome do curso!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="divulgationName" label="Nome para Divulgação (opcional)">
            <Input />
          </Form.Item>
          <Form.Item name="sigla" label="Sigla usada no Campus" rules={[{ required: true, message: 'Por favor, insira a sigla!' }]}>
            <Input />
          </Form.Item>
           <Form.Item name="codigoSuap" label="Código usado no sistema SUAP">
            <Input />
          </Form.Item>
          <Form.Item name="eixo" label="Eixo" rules={[{ required: true, message: 'Por favor, selecione um eixo!' }]}>
            <Select placeholder="Selecione o eixo">
              <Option value="Gestão e Negócios">Gestão e Negócios</Option>
              <Option value="Informação e Comunicação">Informação e Comunicação</Option>
              <Option value="Recursos Naturais">Recursos Naturais</Option>
              <Option value="Outro">Outro</Option>
            </Select>
          </Form.Item>
          <Form.Item name="modalidadeOferta" label="Modalidade de Oferta" rules={[{ required: true }]}>
            <Select>
              <Option value="Presencial">Presencial</Option>
              <Option value="EAD">EAD</Option>
              <Option value="Híbrido">Híbrido</Option>
            </Select>
          </Form.Item>
          <Form.Item name="formaOferta" label="Forma de Oferta" rules={[{ required: true }]}>
             <Select>
              <Option value="Superior">Superior</Option>
              <Option value="Técnico">Técnico</Option>
              <Option value="FIC">FIC</Option>
            </Select>
          </Form.Item>
          <Form.Item name="valorHoraAula" label="Valor Hora/Aula (em minutos)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
             <Checkbox.Group>
                <Checkbox value="Semestral">Semestral</Checkbox>
                <Checkbox value="Graduação">Graduação</Checkbox>
                <Checkbox value="Anual">Anual</Checkbox>
                <Checkbox value="Pós-graduação">Pós-graduação</Checkbox>
             </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursePage;