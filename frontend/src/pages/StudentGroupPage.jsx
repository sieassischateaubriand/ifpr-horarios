// frontend/src/pages/StudentGroupPage.jsx

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
  DatePicker,
  Space,
  Popconfirm,
  message,
  Typography,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'; // Importante para lidar com datas

const { Title } = Typography;
const { Option } = Select;

const API_URL = 'http://localhost:5000/api/student-groups';
const COURSES_API_URL = 'http://localhost:5000/api/courses';

const StudentGroupPage = () => {
  const [studentGroups, setStudentGroups] = useState([]);
  const [courses, setCourses] = useState([]); // State para armazenar a lista de cursos
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form] = Form.useForm();

  // Função para buscar as turmas
  const fetchStudentGroups = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudentGroups(response.data);
    } catch (error) {
      message.error('Falha ao carregar as turmas.');
    }
  };

  // Função para buscar os cursos (para o dropdown)
  const fetchCourses = async () => {
    try {
      const response = await axios.get(COURSES_API_URL);
      setCourses(response.data);
    } catch (error) {
      message.error('Falha ao carregar os cursos para seleção.');
    }
  };

  useEffect(() => {
    fetchStudentGroups();
    fetchCourses();
  }, []);

  const handleAdd = () => {
    setEditingGroup(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingGroup(record);
    // Para o antd DatePicker funcionar corretamente na edição
    const formattedRecord = {
        ...record,
        course: record.course?._id, // Passa apenas o ID para o Select
        conclusionDate: record.conclusionDate ? dayjs(record.conclusionDate) : null,
    };
    form.setFieldsValue(formattedRecord);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success('Turma deletada com sucesso!');
      fetchStudentGroups();
    } catch (error) {
      message.error('Falha ao deletar a turma.');
    }
  };

  const handleOk = () => {
    form.submit();
  };

  const onFinish = async (values) => {
    try {
      if (editingGroup) {
        await axios.put(`${API_URL}/${editingGroup._id}`, values);
        message.success('Turma atualizada com sucesso!');
      } else {
        await axios.post(API_URL, values);
        message.success('Turma criada com sucesso!');
      }
      setIsModalVisible(false);
      fetchStudentGroups();
    } catch (error) {
      message.error(error.response?.data?.error || 'Falha ao salvar a turma.');
    }
  };

  const columns = [
    { title: 'Nome/Cód. Turma', dataIndex: 'name', key: 'name' },
    {
      title: 'Curso',
      dataIndex: 'course',
      key: 'course',
      render: (course) => course ? `${course.name} (${course.sigla})` : 'N/A',
    },
    { title: 'Nº Alunos', dataIndex: 'numberOfStudents', key: 'numberOfStudents' },
    {
      title: 'Períodos',
      dataIndex: 'periodosOcorrencia',
      key: 'periodosOcorrencia',
      render: (tags) => (
          <>
            {tags.map(tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
          </>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Editar</Button>
          <Popconfirm title="Tem certeza que deseja deletar?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />}>Deletar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Cadastro de Turmas</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        Adicionar Turma
      </Button>
      <Table columns={columns} dataSource={studentGroups} rowKey="_id" bordered />

      <Modal
        title={editingGroup ? 'Editar Turma' : 'Adicionar Nova Turma'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="Salvar"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Nome/Código da Turma (Ex: TGC2025, EECM2024)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="course" label="Curso" rules={[{ required: true }]}>
            <Select placeholder="Selecione o curso ao qual esta turma pertence">
              {courses.map(course => (
                <Option key={course._id} value={course._id}>{course.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="numberOfStudents" label="Número de Estudantes" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="conclusionDate" label="Data Prevista de Conclusão">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="codigoSuap" label="Código usado no sistema SUAP">
            <Input />
          </Form.Item>

          <Title level={5}>Período(s) de Ocorrência das Aulas</Title>
          <Form.List name="periodosOcorrencia" rules={[{ required: true, message: 'Adicione pelo menos um período.' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...field} noStyle>
                      <Select placeholder="Selecione o período" style={{width: 200}}>
                        <Option value="Matutino">Matutino</Option>
                        <Option value="Vespertino">Vespertino</Option>
                        <Option value="Noturno">Noturno</Option>
                        <Option value="Integral">Integral</Option>
                      </Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Adicionar Período
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Title level={5}>Salas Preferenciais (Opcional)</Title>
           <Form.List name="salasPreferenciais">
            {(fields, { add, remove }) => (
               <>
                {fields.map(field => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...field} noStyle>
                       <Input placeholder="Nome da sala preferencial" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                 <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Adicionar Sala Preferencial
                  </Button>
                </Form.Item>
               </>
            )}
          </Form.List>

        </Form>
      </Modal>
    </div>
  );
};

export default StudentGroupPage;