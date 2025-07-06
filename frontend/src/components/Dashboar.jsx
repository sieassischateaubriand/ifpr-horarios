import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Building,
  GraduationCap
} from 'lucide-react';

// Dados mockados para demonstração
const mockData = {
  administrator: {
    stats: [
      { title: 'Total de Cursos', value: '12', icon: BookOpen, trend: '+2 este mês' },
      { title: 'Usuários Ativos', value: '156', icon: Users, trend: '+8 esta semana' },
      { title: 'Distribuições Ativas', value: '8', icon: Calendar, trend: '2025.2' },
      { title: 'Salas Cadastradas', value: '45', icon: Building, trend: '3 em manutenção' },
    ],
    recentActivities: [
      { action: 'Nova distribuição criada', course: 'Gestão Comercial', time: '2 horas atrás' },
      { action: 'Usuário cadastrado', course: 'Sistema', time: '4 horas atrás' },
      { action: 'Relatório gerado', course: 'Informática', time: '1 dia atrás' },
    ]
  },
  coordinator: {
    stats: [
      { title: 'Meus Cursos', value: '3', icon: BookOpen, trend: 'Ativos' },
      { title: 'Turmas Ativas', value: '18', icon: Users, trend: '2025.2' },
      { title: 'Disciplinas', value: '45', icon: FileText, trend: 'Cadastradas' },
      { title: 'Atividades Planejadas', value: '127', icon: Calendar, trend: 'Este semestre' },
    ],
    recentActivities: [
      { action: 'Restrição aprovada', course: 'Prof. Silva', time: '1 hora atrás' },
      { action: 'Nova atividade criada', course: 'Matemática', time: '3 horas atrás' },
      { action: 'Turma atualizada', course: 'TGC2024', time: '5 horas atrás' },
    ]
  },
  teacher: {
    stats: [
      { title: 'Minhas Disciplinas', value: '4', icon: BookOpen, trend: 'Este semestre' },
      { title: 'Aulas por Semana', value: '16', icon: Clock, trend: '2025.2' },
      { title: 'Turmas Atendidas', value: '6', icon: Users, trend: 'Ativas' },
      { title: 'Restrições', value: 'Aprovadas', icon: CheckCircle, trend: 'Status atual' },
    ],
    recentActivities: [
      { action: 'Restrições atualizadas', course: 'Meu perfil', time: '2 dias atrás' },
      { action: 'Horário confirmado', course: 'Física I', time: '3 dias atrás' },
      { action: 'Nova turma atribuída', course: 'Química', time: '1 semana atrás' },
    ]
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const userData = mockData[user?.role] || mockData.teacher;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Boa noite';
    
    if (hour < 12) greeting = 'Bom dia';
    else if (hour < 18) greeting = 'Boa tarde';
    
    return `${greeting}, ${user?.name?.split(' ')[0]}!`;
  };

  const getRoleDescription = () => {
    const descriptions = {
      administrator: 'Você tem acesso completo ao sistema. Gerencie usuários, cursos e configurações.',
      coordinator: 'Gerencie seus cursos, turmas e a distribuição de aulas dos seus programas.',
      teacher: 'Visualize suas aulas e gerencie suas restrições de horário.'
    };
    return descriptions[user?.role] || descriptions.teacher;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
        <p className="text-muted-foreground">{getRoleDescription()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userData.stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.course} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Informações importantes e alertas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Sistema Operacional</p>
                  <p className="text-xs text-muted-foreground">
                    Todos os serviços funcionando normalmente
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Backup Agendado</p>
                  <p className="text-xs text-muted-foreground">
                    Próximo backup: hoje às 23:00
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Performance</p>
                  <p className="text-xs text-muted-foreground">
                    Tempo de resposta médio: 120ms
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {user?.role === 'administrator' && (
              <>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Users className="h-6 w-6" />
                  <span>Gerenciar Usuários</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <BookOpen className="h-6 w-6" />
                  <span>Cursos</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span>Relatórios</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Building className="h-6 w-6" />
                  <span>Salas</span>
                </Button>
              </>
            )}
            
            {user?.role === 'coordinator' && (
              <>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Calendar className="h-6 w-6" />
                  <span>Distribuir Aulas</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Users className="h-6 w-6" />
                  <span>Turmas</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Clock className="h-6 w-6" />
                  <span>Restrições</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span>Disciplinas</span>
                </Button>
              </>
            )}
            
            {user?.role === 'teacher' && (
              <>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Clock className="h-6 w-6" />
                  <span>Minhas Restrições</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Calendar className="h-6 w-6" />
                  <span>Meus Horários</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <GraduationCap className="h-6 w-6" />
                  <span>Meu Perfil</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

