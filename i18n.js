/* =================== RUMBO · Internacionalización =================== */
/* Idiomas: es, en, pt, he, ar, ru, zh, it, fr, ja
   he y ar son de derecha a izquierda (RTL). */

var RTL_LANGS = ['he', 'ar'];

var I18N = {
  es: {
    _name: 'Español', _en: 'Spanish',
    appTagline: 'Sigue tus metas, un paso a la vez',
    settings: 'Ajustes', back: 'Volver', allGoals: 'Todas mis metas',
    newGoal: 'Nueva meta', editGoal: 'Editar meta', createGoal: 'Crear meta',
    saveChanges: 'Guardar cambios', cancel: 'Cancelar', delete: 'Eliminar',
    emptyTitle: 'Empieza tu primera meta',
    emptyDesc: 'Elige algo que quieras lograr, ponle un plazo y marca tu avance cada día. Pulsa el botón Nueva meta de abajo para empezar.',
    completed: 'completada', completedPl: 'completadas',
    oneGoal: 'meta', manyGoals: 'metas',
    inProgress: 'En progreso', done: 'Completada', allDone: '¡Todo completado! 🎉',
    activeOne: 'meta activa', activeMany: 'metas activas', youHave: 'Tienes',
    myGoals: 'Mis metas', goalDeadline: 'Meta:',
    whatAchieve: '¿Qué quieres lograr?', goalNamePh: 'Ej: Leer un libro, correr 5K…',
    icon: 'Icono', goalType: 'Tipo de meta',
    typeDays: 'Por días', typeDaysDesc: 'Marca cada día o etapa',
    typeNum: 'Numérica', typeNumDesc: 'Suma hacia un total',
    frequency: '¿Con qué frecuencia?',
    freqDaily: 'Días seguidos', freqWeekly: 'Días de la semana',
    freqManual: 'Fechas manuales', freqImport: 'Importar cronograma',
    howManyDays: '¿Cuántos días seguidos?', daysHint: 'Una etapa por día consecutivo desde la fecha de inicio.',
    howManyStages: '¿Cuántas etapas en total?', stagesHint: 'Cuántas clases, sesiones o repeticiones quieres en total.',
    whichWeekdays: '¿Qué días de la semana?', weekdaysHint: 'Elige uno o más días. Las etapas caerán en esos días.',
    startDate: 'Fecha de inicio',
    yourDates: 'Tus fechas', addDate: 'Añadir fecha',
    manualHint: 'Añade una por una las fechas en las que quieras una etapa. El orden se ajusta solo. Luego podrás nombrarlas.',
    noDatesYet: 'Aún no has añadido fechas.',
    uploadSchedule: 'Sube tu cronograma', tapToChoose: 'Toca para elegir un archivo',
    importFormats: 'CSV · Excel · PDF · Imagen · Word',
    freeBadge: 'CSV y Excel: gratis', aiBadge: 'PDF, imagen y Word: con IA',
    importHint: 'La app leerá tu cronograma y creará una etapa por cada fecha. Podrás revisarlas antes de crear la meta.',
    targetNum: 'Meta a alcanzar (número)', unitOpt: 'Unidad (opcional)',
    unitPh: 'Ej: capítulos, lecciones…',
    unitOther: 'Otra…', unitOtherLabel: 'Escribe tu unidad',
    unitNone: 'Sin unidad', unitKm: 'km', unitM: 'm', unitSteps: 'pasos',
    unitPages: 'páginas', unitChapters: 'capítulos', unitWords: 'palabras',
    unitHours: 'horas', unitMinutes: 'minutos', unitSessions: 'sesiones',
    unitReps: 'repeticiones', unitSets: 'series', unitLiters: 'litros',
    unitGlasses: 'vasos', unitCalories: 'calorías', unitEuro: '€', unitDollar: '$',
    toastBadUnit: 'Escribe una unidad válida (p. ej. páginas, lecciones).',
    stages: 'Etapas', addStage: 'Añadir etapa', deleteStage: 'Borrar etapa',
    stageName: 'Nombre de la etapa', save: 'Guardar',
    viewNote: 'Ver nota', addNote: 'Añadir nota', notePh: 'Escribe una nota para esta etapa…',
    saveNote: 'Guardar nota', savedOn: 'Guardada:',
    percentDone: 'completado', ofUnit: 'de', ofDays: 'de', daysUnit: 'días',
    howMuch: '¿Cuánto sumaste?', add: 'Sumar', adjustTotal: 'Ajustar total…',
    firstStepMsg: 'Marca tu primer avance para arrancar.',
    darkMode: 'Tema oscuro', darkModeDesc: 'Cambia la apariencia',
    reminder: 'Recordatorio diario', reminderDesc: 'Un aviso para no perder el ritmo',
    aiMotiv: 'Mensajes con IA', aiMotivDesc: 'Frases motivadoras únicas al avanzar',
    aiPlanTitle: 'Crear meta con IA', aiPlanSub: 'Escribe qué quieres lograr y armo el plan por ti.',
    aiPlanPh: 'Ej: aprender a tocar guitarra, correr 5K, ahorrar para un viaje…',
    aiPlanBtn: 'Crear mi plan', aiPlanOr: 'o créala manualmente',
    aiPlanLoading: 'Creando tu plan con IA… un momento.',
    aiPlanReady: 'Plan listo. Revisa las etapas abajo y crea la meta.',
    aiPlanNeedText: 'Escribe qué quieres lograr.',
    aiPlanNoStages: 'No pude crear un plan. Prueba a describir la meta de otra forma.',
    aiPlanError: 'No se pudo crear el plan. Inténtalo de nuevo.',
    modeAiTitle: 'Crear con IA', modeAiDesc: 'Describe tu meta y la IA arma el plan por ti.',
    modeManualTitle: 'Crear manualmente', modeManualDesc: 'Tú defines las etapas, fechas y detalles.',
    language: 'Idioma', languageDesc: 'Elige el idioma de la app',
    exportData: 'Exportar mis datos', exportDesc: 'Guarda una copia de seguridad',
    importData: 'Importar datos', importDataDesc: 'Restaura desde una copia',
    wipe: 'Borrar todo', wipeDesc: 'Elimina todas las metas',
    footer: 'Tus datos se guardan solo en este dispositivo.', version: 'Versión',
    confirmDelGoal: 'Se borrará esta meta con todo su progreso y notas. No se puede deshacer.',
    confirmDelStage: 'Se eliminará esta etapa con su nota. ¿Continuar?',
    confirmDelNote: '¿Seguro que quieres borrar esta nota?',
    confirmWipe: 'Se eliminarán todas tus metas, avances y notas de este dispositivo. No se puede deshacer.',
    confirmImport: 'Esto reemplazará tus metas actuales por las de la copia. ¿Continuar?',
    dupName: 'Nombre repetido', createAnyway: 'Crear igual',
    dupMsg1: 'Ya tienes una meta llamada', dupMsg2: '¿Quieres crear otra con el mismo nombre de todas formas?',
    toastSaved: 'Guardado', toastGoalCreated: '¡Meta creada!', toastGoalUpdated: 'Meta actualizada',
    toastGoalImported: '¡Meta creada desde tu cronograma!', toastStageUpdated: 'Etapa actualizada',
    toastStageAdded: 'Etapa añadida. Pulsa el lápiz para nombrarla.', toastNoteSaved: 'Nota guardada',
    toastNeedName: 'Ponle un nombre a tu meta.', toastNeedStages: 'Indica cuántas etapas.',
    toastNeedWeekday: 'Elige al menos un día de la semana.', toastNeedDate: 'Añade al menos una fecha.',
    toastNeedTarget: 'Indica el número a alcanzar.', toastNeedNumber: 'Escribe un número.',
    toastEmptyNote: 'Escribe algo antes de guardar.', toastNeedSchedule: 'Sube un cronograma primero.',
    toastNeedOneStage: 'Una meta necesita al menos una etapa.', toastPickDate: 'Elige una fecha primero.',
    toastDateExists: 'Esa fecha ya está en la lista.', toastExported: 'Copia descargada',
    toastImported: 'Datos importados', toastInvalidFile: 'Archivo no válido',
    toastNoSpace: 'No se pudo guardar. ¿Espacio lleno?', toastNotifOn: 'Recordatorio activado',
    toastNotifOff: 'Recordatorio desactivado', toastNotifDenied: 'Permiso denegado',
    toastNoNotif: 'Tu navegador no admite avisos', toastNoDatesGen: 'No se pudieron generar las fechas. Revisa los datos.',
    dayLabel: 'Día', stageLabel: 'Etapa',
    importAnalyzing: 'Analizando con IA… esto puede tardar unos segundos.',
    importReadingCsv: 'Leyendo tu archivo CSV…', importReadingExcel: 'Leyendo tu Excel…',
    importReadingWord: 'Leyendo el documento Word…',
    importFound: 'Encontré', importFoundStages: 'etapas. Revísalas y crea la meta.', importFoundStage: 'etapa. Revísala y crea la meta.',
    importNoDates: 'No encontré fechas en el archivo. Revisa que tenga una columna de fecha, o prueba con otro formato.',
    importNotSchedule: 'Este archivo no parece un cronograma, así que no puedo crear etapas con él. Sube un documento o imagen con una lista de fechas y temas (por ejemplo, un calendario de clases o un plan de entrenamiento). También puedes crear tu meta a mano o con el generador de IA.',
    importBadFormat: 'Formato no admitido. Usa CSV, Excel, PDF, imagen o Word.',
    importReadError: 'No se pudo leer el archivo:', importMore: 'más…',
    reminderBody: '¿Ya avanzaste hoy en tus metas? Un pequeño paso cuenta.',
    weekdays: ['D','L','M','X','J','V','S'],
    weekdaysFull: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    motiv: [
      "Cada paso cuenta, y acabas de dar uno.","La constancia vence al talento. Sigue así.",
      "Bien hecho. Tu yo del futuro te lo agradece.","Lo empezado ya no vuelve a cero. Adelante.",
      "Pequeños avances diarios construyen grandes logros.","Hoy estás más cerca que ayer. Eso es progreso.",
      "No subestimes lo lejos que has llegado.","El impulso se construye un día a la vez. ¡Vas bien!",
      "Avanzar es ganar. Y hoy ganaste otra vez.","Lo difícil de hoy será lo natural de mañana.",
      "Tu esfuerzo se nota en esa barra. ¡Sigue!","Terminar lo que empiezas es un superpoder. Lo tienes.",
      "Un paso más, una excusa menos. Orgulloso de tu esfuerzo.","La disciplina de hoy es la libertad de mañana.",
      "Estás convirtiendo la intención en hábito. Genial.","Nada detiene a quien avanza con propósito.",
      "Mira cuánto has recorrido. La meta se acerca.","Cada marca es una promesa que te cumples.",
      "El progreso no siempre se ve, pero hoy sí. ¡Bravo!","Sigue el ritmo: lo estás haciendo de verdad.",
      "Que nada apague tus ganas. Vas por buen camino.","Hoy elegiste avanzar. Esa decisión suma.",
      "La meta está más cerca del final que del inicio.","Constancia sobre motivación. Y aquí sigues.",
      "El último tramo sabe distinto. Sigue subiendo.","Estás a un paso más de lograrlo. No aflojes.",
      "Grande no es el paso, grande es no detenerse.","Lo estás haciendo. Punto. Sigue adelante.",
      "Tu compromiso contigo mismo se ve hoy.","Casi en la cima. Este avance pesa. ¡Vamos!"
    ],
    finishMsg: "¡Lo lograste! Completaste tu meta. Date el crédito que mereces. 🎉"
  }
};

/* Para los idiomas que aún no están traducidos, se usará español como respaldo.
   Las traducciones completas se cargan desde i18n-langs.js */
var CURRENT_LANG = 'es';

function detectLang(){
  try{
    const saved = localStorage.getItem('rumbo_lang');
    if(saved && I18N[saved]) return saved;
  }catch(e){}
  const nav = (navigator.language || 'es').slice(0,2).toLowerCase();
  return I18N[nav] ? nav : 'es';
}
function setLang(lang){
  if(!I18N[lang]) lang='es';
  CURRENT_LANG = lang;
  try{ localStorage.setItem('rumbo_lang', lang); }catch(e){}
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
}
function t(key){
  const L = I18N[CURRENT_LANG] || I18N.es;
  return (L[key] !== undefined) ? L[key] : (I18N.es[key] !== undefined ? I18N.es[key] : key);
}
