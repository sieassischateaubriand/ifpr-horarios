// frontend/src/pages/SubjectPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, DatePicker, Checkbox,
  Space, Popconfirm, message, Typography
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const API_URL = 'http://localhost:5000/api/subjects';
const COURSES_API_URL = 'http://localhost:5000/api/courses';

const SubjectPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(API_URL);
      setSubjects(response.data);
    } catch (error) {
      message.error('Falha ao carregar as disciplinas.');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(COURSES_API_URL);
      setCourses(response.data);
    } catch (error) {
      message.error('Falha ao carregar os cursos.');
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchCourses();
  }, []);

  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSubject(record);
    const formattedRecord = {
      ...record,
      course: record.course?._id,
      ementa: {
        ...record.ementa,
        dataVigencia: record.ementa?.dataVigencia ? dayjs(record.ementa.dataVigencia) : null,
      }
    };
    form.setFieldsValue(formattedRecord);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success('Disciplina deletada com sucesso!');
      fetchSubjects();
    } catch (error) {
      message.error('Falha ao deletar a disciplina.');
    }
  };

  const onFinish = async (values) => {
    try {
      if (editingSubject) {
        await axios.put(`${API_URL}/${editingSubject._id}`, values);
        message.success('Disciplina atualizada com sucesso!');
      } else {
        await axios.post(API_URL, values);
        message.success('Disciplina criada com sucesso!');
      }
      setIsModalVisible(false);
      fetchSubjects();
    } catch (error) {
      message.error(error.response?.data?.error || 'Falha ao salvar a disciplina.');
    }
  };

  const columns = [
    { title: 'Nome da Disciplina', dataIndex: 'name', key: 'name' },
    {
      title: 'Curso',
      dataIndex: 'course',
      key: 'course',
      render: (course) => course ? course.name : 'N/A',
    },
    { title: 'Módulo', dataIndex: 'modulo', key: 'modulo' },
    {
      title: 'C.H. Total',
      dataIndex: 'ementa',
      key: 'ch',
      render: (ementa) => ementa ? `${ementa.cargaHorariaTotal} h/a` : 'N/A',
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
      <Title level={2}>Cadastro de Disciplinas</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        Adicionar Disciplina
      </Button>
      <Table columns={columns} dataSource={subjects} rowKey="_id" bordered />

      <Modal
        title={editingSubject ? 'Editar Disciplina' : 'Adicionar Nova Disciplina'}
        visible={isModalVisible}
        onOk={form.submit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="Salvar"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Title level={4}>Informações Gerais</Title>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="course" label="Curso" rules={[{ required: true }]}>
            <Select placeholder="Selecione o curso">
              {courses.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="modulo" label="Módulo/Ano/Semestre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Checkbox.Group>
              <Space direction="vertical">
                <Checkbox value="Semestral">Semestral</Checkbox>
                <Checkbox value="Técnica">Técnica</Checkbox>
                <Checkbox value="Optativa">Optativa</Checkbox>
                <Checkbox value="Dependência">Dependência</Checkbox>
                <Checkbox value="Adaptação curricular">Adaptação curricular</Checkbox>
                <Checkbox value="Atendimento Educacional Especializado">Atendimento Educacional Especializado</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Title level={4} style={{ marginTop: 24 }}>Ementa Conforme PPC</Title>
          {/* Note a notação de array no 'name' para objetos aninhados */}
          <Form.Item name={['ementa', 'versaoPPC']} label="Versão PPC">
            <Input />
          </Form.Item>
          <Form.Item name={['ementa', 'dataVigencia']} label="Data Início Vigência PPC">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name={['ementa', 'cargaHorariaTotal']} label="Carga Horária Total (h/a)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name={['ementa', 'cargaHorariaEAD']} label="Carga Horária EaD (h/a)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Title level={4} style={{ marginTop: 24 }}>Área(s) de Conhecimento</Title>
          <Form.List name="areasConhecimento">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Space key={field.key} align="baseline">
                    <Form.Item {...field} noStyle><Input /></Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Adicionar Área</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectPage;