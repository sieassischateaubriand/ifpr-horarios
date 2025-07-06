// frontend/src/pages/DistributionPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Select, Button, Form, InputNumber, Checkbox, Collapse, Space, Typography, message, Spin
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash'; // Biblioteca utilitária para agrupar

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// URLs da nossa API
const COURSES_API_URL = 'http://localhost:5000/api/courses';
const SUBJECTS_API_URL = 'http://localhost:5000/api/subjects';
const GROUPS_API_URL = 'http://localhost:5000/api/student-groups';
const TEACHERS_API_URL = 'http://localhost:5000/api/teachers';
const ACTIVITIES_API_URL = 'http://localhost:5000/api/activities';

const DistributionPage = () => {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [distributionId, setDistributionId] = useState(null);
  
  const [loading, setLoading] = useState(false);

  // Carrega todos os dados básicos na montagem do componente
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [coursesRes, subjectsRes, groupsRes, teachersRes] = await Promise.all([
          axios.get(COURSES_API_URL),
          axios.get(SUBJECTS_API_URL),
          axios.get(GROUPS_API_URL),
          axios.get(TEACHERS_API_URL)
        ]);
        setCourses(coursesRes.data);
        setSubjects(subjectsRes.data);
        setGroups(groupsRes.data);
        setTeachers(teachersRes.data);
      } catch (error) {
        message.error("Falha ao carregar dados iniciais.");
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Efeito para carregar as atividades quando uma distribuição é selecionada
  useEffect(() => {
    if (distributionId) {
      const fetchActivities = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${ACTIVITIES_API_URL}/by-distribution/${distributionId}`);
          // Agrupa as atividades por disciplina para montar os painéis
          const activitiesBySubject = _.groupBy(response.data, 'subject._id');
          form.setFieldsValue({ activitiesBySubject });
        } catch (error) {
          message.error("Falha ao carregar a distribuição salva.");
        }
        setLoading(false);
      };
      fetchActivities();
    } else {
        form.setFieldsValue({ activitiesBySubject: {} });
    }
  }, [distributionId, form]);

  // Handler para quando o curso ou período muda
  const handleSelectionChange = (value, type) => {
    const courseId = type === 'course' ? value : selectedCourseId;
    const period = type === 'period' ? value : selectedPeriod;

    setSelectedCourseId(courseId);
    setSelectedPeriod(period);

    if (courseId && period) {
      // Cria um ID único para a distribuição, ex: "60f...abc-2025.2"
      const courseSigla = courses.find(c => c._id === courseId)?.sigla || 'CURSO';
      setDistributionId(`${period}-${courseSigla}`);
    } else {
      setDistributionId(null);
    }
  };
  
  // Filtra as opções dos selects com base no curso selecionado
  const filteredSubjects = subjects.filter(s => s.course._id === selectedCourseId);
  const filteredGroups = groups.filter(g => g.course._id === selectedCourseId);

  const onFinish = async (values) => {
    setLoading(true);
    // Transforma o objeto agrupado em uma lista plana de atividades
    const flatActivities = _.flatMap(values.activitiesBySubject, (activitiesInSubject) => {
        return activitiesInSubject || [];
    });

    try {
        await axios.post(`${ACTIVITIES_API_URL}/bulk-update`, {
            activities: flatActivities,
            distributionId: distributionId,
        });
        message.success('Distribuição salva com sucesso!');
    } catch (error) {
        message.error("Falha ao salvar a distribuição.");
    }
    setLoading(false);
  };
  
  // Renderiza o formulário de uma única atividade
  const renderActivityForm = (field, remove, subjectId) => (
    <div key={field.key} style={{ border: '1px solid #d9d9d9', padding: 16, marginBottom: 16, borderRadius: 8 }}>
      <Form.Item name={[field.name, 'subject']} initialValue={subjectId} hidden><Input /></Form.Item>
      
      <Form.Item name={[field.name, 'studentGroup']} label="Turma" rules={[{ required: true }]}>
        <Select placeholder="Selecione a turma">
          {filteredGroups.map(g => <Option key={g._id} value={g._id}>{g.name}</Option>)}
        </Select>
      </Form.Item>

      <Form.Item name={[field.name, 'teachers']} label="Professor(es)" rules={[{ required: true }]}>
          <Select mode="multiple" placeholder="Selecione o(s) professor(es)">
             {teachers.map(t => <Option key={t._id} value={t._id}>{t.name}</Option>)}
          </Select>
      </Form.Item>
      
      <Form.Item name={[field.name, 'aulasPorSemana']} label="Total Aulas/Semana" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item name={[field.name, 'semestre']} label="Semestre da Oferta" rules={[{ required: true }]}>
        <Input placeholder="Ex: 1, 2, 3..." />
      </Form.Item>

      <Form.Item name={[field.name, 'divideTurma']} valuePropName="checked">
        <Checkbox>Este professor divide a turma em 2 grupos (para aulas práticas)</Checkbox>
      </Form.Item>

      <Button type="danger" onClick={() => remove(field.name)} icon={<DeleteOutlined />}>
        Remover Aula
      </Button>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Distribuição de Aulas por Disciplina</Title>
      
      <Space style={{ marginBottom: 24 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Selecione um Curso"
          onChange={(value) => handleSelectionChange(value, 'course')}
        >
          {courses.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
        </Select>
        <Select
          style={{ width: 200 }}
          placeholder="Selecione o Período"
          onChange={(value) => handleSelectionChange(value, 'period')}
        >
          <Option value="2025.1">2025.1</Option>
          <Option value="2025.2">2025.2</Option>
          {/* Adicione mais períodos conforme necessário */}
        </Select>
      </Space>

      {distributionId && (
        <Spin spinning={loading}>
          <Form form={form} onFinish={onFinish} autoComplete="off">
            <Collapse accordion>
              {filteredSubjects.map(subject => (
                <Panel header={`${subject.name} - C.H. ${subject.ementa.cargaHorariaTotal}h/a`} key={subject._id}>
                  <Form.List name={['activitiesBySubject', subject._id]}>
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(field => renderActivityForm(field, remove, subject._id))}
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Adicionar Aula para esta Disciplina
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Panel>
              ))}
            </Collapse>
            <Button type="primary" htmlType="submit" style={{ marginTop: 24 }}>
              Salvar Distribuição Completa
            </Button>
          </Form>
        </Spin>
      )}
    </div>
  );
};

export default DistributionPage;