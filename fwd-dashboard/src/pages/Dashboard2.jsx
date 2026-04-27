import AgendaEntrevistas from '../components/Dashboard2/AgendaEntrevistas';
import FormularioEntrevista from '../components/Dashboard2/FormularioEntrevista';
import CronogramaFases from '../components/Dashboard2/CronogramaFases';
import CampusDays from '../components/Dashboard2/CampusDays';

const Dashboard2 = () => {
  return (
    <div>
      <h1>Dashboard 2: Entrevistas y Eventos</h1>
      <AgendaEntrevistas />
      <FormularioEntrevista />
      <CronogramaFases />
      <CampusDays />
    </div>
  );
};

export default Dashboard2;
