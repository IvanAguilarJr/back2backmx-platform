import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import type { Module, Piece } from "../src/lib/types";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
}

type SeedPiece = Omit<Piece, "id" | "moduleId" | "order" | "gender"> & {
  gender?: string[];
};

type SeedModule = Omit<Module, "order"> & {
  pieces: SeedPiece[];
};

const MODULES: SeedModule[] = [
  {
    id: "cuerpo-limites",
    title: "Cuidado del cuerpo y límites personales",
    badge: "Alta prioridad, prevención y protección",
    desc: "Un módulo para enseñar privacidad, consentimiento, límites y cómo pedir ayuda de forma clara y segura.",
    tags: ["Alta prioridad", "Prevención", "Protección"],
    priority: true,
    icon: "shield",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        title: "Antes de empezar",
        summary: "Cómo está planteado este contenido y para quién es.",
        text: "<b>Importante:</b> este contenido está planteado en formato preventivo y educativo. Su propósito es ayudar a enseñar seguridad corporal, límites personales y búsqueda de ayuda de una forma clara, sensible y apropiada para niñas, niños y adolescentes.<br><br>Hablar del cuerpo, la privacidad y los límites personales de forma clara y tranquila ayuda a prevenir riesgos y fortalece la seguridad de niñas, niños y adolescentes. Este módulo busca enseñar que su cuerpo merece respeto, que pueden decir no ante algo que les incomoda y que siempre pueden buscar ayuda de un adulto seguro.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: [],
        title: "Puntos clave para recordar",
        summary: "6 ideas centrales de este módulo.",
        items: [
          "El cuerpo tiene partes visibles y partes privadas que deben ser respetadas.",
          "Los límites personales ayudan a distinguir lo que se siente seguro y lo que incomoda.",
          "Nadie debe tocar, mirar, fotografiar o pedir guardar secretos sobre partes privadas.",
          "Si algo incomoda, confunde o asusta, el niño puede decir no, alejarse y pedir ayuda.",
          "Hablar con palabras correctas y sin vergüenza favorece prevención y protección.",
          "La seguridad corporal se aprende mejor con repetición, calma y confianza.",
        ],
      },
      {
        kind: "semaforo",
        renderType: "semaforo",
        age: ["5-8", "9-12"],
        title: "Semáforo: ¿qué está bien y qué no?",
        summary: "Rojo, amarillo y verde según la situación.",
        rojo: {
          label: "Rojo: nadie puede",
          title: "Rojo: nadie puede",
          text: "Son situaciones que no deben pasar. Nadie debe tocar, mirar, fotografiar, besar o hacer juegos sobre partes privadas. Tampoco deben pedir al niño guardar secretos incómodos sobre su cuerpo.",
          items: [
            "Tocar partes privadas",
            "Pedir mostrar el cuerpo",
            "Tomar fotos del cuerpo sin permiso",
            "Pedir guardar un secreto que da miedo o vergüenza",
          ],
        },
        amarillo: {
          label: "Amarillo: pregunta primero — ⚠️ PLACEHOLDER, verificar con el equipo",
          title: "Amarillo: pregunta primero",
          text: "[PLACEHOLDER — este texto no viene de la página original, lo redacté como relleno razonable. El equipo debe revisarlo/reemplazarlo con el contenido real antes de publicar.] Situaciones que dependen del contexto y de un adulto de confianza presente.",
          items: [
            "Un doctor revisando con un adulto de confianza presente",
            "Ayuda para bañarse a una edad en que ya empieza a hacerlo solo",
            "Alguien nuevo pidiendo un abrazo o beso",
          ],
        },
        verde: {
          label: "Verde: está bien — ⚠️ PLACEHOLDER, verificar con el equipo",
          title: "Verde: está bien",
          text: "[PLACEHOLDER — mismo caso que arriba, redactar con el equipo.] Situaciones normales y seguras que no deben generar alarma ni confusión.",
          items: [
            "Un abrazo de un familiar de confianza cuando el niño quiere",
            "Que un doctor revise con un padre/madre presente y el niño de acuerdo",
            "Hablar abiertamente de su cuerpo con un adulto seguro",
          ],
        },
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "shield",
        title: "Mi cuerpo merece respeto",
        summary: "El mensaje principal: el cuerpo de cada niño tiene valor y merece respeto.",
        text: "El mensaje principal de este módulo es que el cuerpo de cada niña, niño y adolescente tiene valor y merece respeto. Aprender esto fortalece autoestima, confianza y capacidad para identificar situaciones seguras o inseguras. No se busca generar miedo, sino claridad y protección.",
        tip: "Refuerza esta idea en momentos cotidianos, no solo en una plática formal — por ejemplo al vestirse o bañarse.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["5-8", "9-12"],
        icon: "brain",
        title: "Partes privadas y lenguaje claro",
        summary: "Por qué usar las palabras correctas ayuda a prevenir confusión.",
        text: "Usar palabras claras, correctas y sin vergüenza ayuda a prevenir confusión y facilita que el niño pueda comunicar algo importante si llega a pasar. También permite que entienda mejor qué partes del cuerpo son privadas y qué significa cuidarlas.",
        tip: "Usa los nombres correctos de las partes del cuerpo desde pequeños — evita apodos que generen vergüenza o confusión.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "handshake",
        title: "Consentimiento y límites",
        summary: "Cómo enseñar que sus límites importan y pueden decir no.",
        text: "Las niñas, niños y adolescentes necesitan aprender que pueden expresar incomodidad y que sus límites importan. Esto incluye poder decir 'no quiero', 'me incomoda', 'detente' o 'voy a pedir ayuda'. Enseñar límites no es promover distancia, sino seguridad y autonomía personal.",
        tip: 'Practica con ejemplos de la vida diaria (cosquillas, abrazos) para que decir "no" se sienta natural, no solo en un tema grave.',
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["13-15", "16-19"],
        icon: "handshake",
        title: "Adultos seguros y secretos que no se guardan",
        summary: "Qué secretos nunca deben guardarse, y a quién acudir.",
        text: "No todos los secretos deben guardarse. Si un secreto hace sentir miedo, culpa, vergüenza o incomodidad, debe contarse. También es útil que cada niño identifique con anticipación a qué adultos puede acudir si necesita ayuda en casa, escuela o comunidad.",
        tip: "Pueden hacer una lista con 3 adultos seguros a quienes pueda buscar si algo le preocupa o lo hace sentir inseguro.",
      },
      {
        kind: "tip",
        renderType: "actionLists",
        age: [],
        title: "Qué hacer y qué decir",
        summary: "Pasos concretos y frases para practicar juntos.",
        colA: {
          title: "Qué hacer si algo incomoda",
          items: [
            "Di con claridad: 'No' o 'Detente'.",
            "Aléjate si puedes hacerlo con seguridad.",
            "Busca a un adulto seguro de inmediato.",
            "Cuenta lo que pasó con tus propias palabras.",
            "Sigue contándolo hasta que alguien te ayude.",
          ],
        },
        colB: {
          title: "Frases útiles para practicar",
          items: [
            "Mi cuerpo merece respeto.",
            "No me gusta eso.",
            "Detente, no quiero.",
            "Voy a buscar ayuda.",
            "No voy a guardar un secreto que me hace sentir mal.",
          ],
        },
      },
    ],
  },
  {
    id: "crisis-emocional",
    title: "Cuando hay crisis emocionales",
    badge: "Qué hacer en el momento",
    desc: "Llanto intenso, enojo o bloqueo. Aprende cómo acompañar sin escalar la situación.",
    tags: ["Uso inmediato", "Alta prioridad", "Guía práctica"],
    priority: false,
    icon: "heart",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        title: "Qué son y por qué pasan",
        summary: "No siempre son berrinches — muchas veces el niño está en alerta.",
        text: "Las crisis emocionales no siempre son berrinches o desobediencia. Muchas veces son señales de que el niño o adolescente se siente abrumado, inseguro o en alerta. En esos momentos, lo más importante no es corregir rápido, sino ayudar a recuperar la calma y la sensación de seguridad.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: [],
        title: "Puntos clave para recordar",
        summary: "6 ideas centrales de este módulo.",
        items: [
          "Cuando un niño se desregula, su cuerpo está en alerta y necesita seguridad.",
          "El adulto regula primero: respira, baja el tono de voz y transmite calma.",
          "Acércate sin invadir, valida la emoción y acompaña antes de corregir.",
          "Señales comunes: llanto intenso, enojo, silencio extremo, tensión corporal o aislamiento.",
          "Herramientas rápidas: respiración lenta, agua, movimiento suave, pausa y contención.",
          "Frases útiles: 'Estás a salvo', 'Estoy contigo', 'Vamos a calmarnos juntos'.",
        ],
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "handshake",
        title: "Paso 1: Primero bajar la intensidad",
        summary: "El objetivo inicial no es enseñar ni corregir — es reducir la intensidad.",
        text: "Cuando hay una crisis emocional, el objetivo inicial no es enseñar, corregir ni pedir explicaciones largas. Lo primero es reducir la intensidad del momento. Un tono de voz calmado, menos palabras y una presencia estable ayudan más que discutir o exigir control inmediato.",
        tip: "⚠️ FALTA — el botón 'Ver sugerencia práctica' no se capturó expandido. Pedir al equipo el texto real.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "sprout",
        title: "Paso 2: El adulto regula antes de intervenir",
        summary: "El niño toma la referencia emocional del adulto para regularse.",
        text: "Si el adulto responde con enojo, prisa o miedo, la crisis puede crecer. Por eso es importante que quien acompaña respire, baje su propia tensión y transmita calma. El niño muchas veces toma la referencia emocional del adulto para comenzar a regularse.",
        tip: "⚠️ FALTA — mismo caso, pedir texto real.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "brain",
        title: "Paso 3: Validar no es permitir todo",
        summary: "Reconocer la emoción y sostener el límite al mismo tiempo.",
        text: "Validar significa reconocer que el niño está pasando por algo intenso, no justificar cualquier conducta. Se puede acompañar con empatía y al mismo tiempo sostener límites. Cuando el niño se siente visto, suele ser más fácil que luego pueda escuchar.",
        tip: "⚠️ FALTA — mismo caso, pedir texto real.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "puzzle",
        title: "Paso 4: Después de la crisis viene la reparación",
        summary: "Hablar de lo ocurrido enseña más que corregir en pleno desborde.",
        text: "Cuando el niño ya está más calmado, entonces sí es momento de hablar sobre lo ocurrido. Ahí se puede revisar qué pasó, qué lo detonó, qué necesitaba y cómo actuar diferente la próxima vez. Ese momento enseña mucho más que corregir en pleno desborde.",
        tip: "⚠️ FALTA — mismo caso, pedir texto real.",
      },
    ],
  },
  {
    id: "sobreestimulacion",
    title: "Cuando hay sobreestimulación",
    badge: "Regular el ambiente también ayuda",
    desc: "Detecta señales sensoriales y usa estrategias simples para disminuir estrés y saturación.",
    tags: ["Ambiente seguro", "Aplicable en casa", "Observación diaria"],
    priority: false,
    icon: "puzzle",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        title: "Qué es y por qué pasa",
        summary: "Regular el ambiente no significa evitar todo estímulo.",
        text: "Algunos niños y adolescentes pueden sentirse sobrepasados por ruidos, luces, texturas o cambios constantes. Regular el ambiente no significa evitar todo estímulo, sino observar qué los afecta y crear condiciones que les ayuden a sentirse más organizados y seguros.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: [],
        title: "Puntos clave para recordar",
        summary: "6 ideas centrales de este módulo.",
        items: [
          "El desarrollo ocurre a través de interacción, juego, movimiento y conexión.",
          "Algunos niños pueden sentir demasiado o muy poco los estímulos del ambiente.",
          "Actividades simples: cantar, construir, dibujar, jugar y explorar texturas.",
          "Estrategias útiles: rincón tranquilo, pausas, balanceo suave y actividades con peso.",
          "Las rutinas ayudan a organizar el sistema sensorial y reducir estrés.",
          "Observar señales: rechazo a contacto, hiperactividad, irritabilidad o dificultad para concentrarse.",
        ],
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "eye",
        title: "Aprender a detectar señales",
        summary: "La sobreestimulación suele aparecer antes de una crisis.",
        text: "La sobreestimulación muchas veces aparece antes de una crisis. Puede notarse en irritabilidad, movimiento excesivo, dificultad para concentrarse, necesidad de aislarse o molestia ante ruidos, luces o contacto físico. Observar estas señales permite intervenir antes de que el malestar aumente.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "home",
        title: "El ambiente también puede regular",
        summary: "No todo depende del niño — a veces el entorno necesita ajustarse.",
        text: "No todo depende del niño. A veces el entorno necesita ajustarse. Bajar ruido, disminuir luces fuertes, reducir estímulos visuales o crear un rincón tranquilo puede ayudar mucho. Pequeños cambios en el ambiente pueden hacer que el niño se sienta menos saturado y más organizado.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "pause",
        title: "Las pausas sensoriales son útiles",
        summary: "No son castigo ni premio — son una herramienta de regulación.",
        text: "Algunos niños necesitan pausas breves durante el día para reorganizarse. Estas pausas no son castigo ni premio, son una herramienta de regulación. Pueden incluir respirar, balancearse suave, tomar agua, caminar un poco o usar actividades con textura o presión si eso les ayuda.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "repeat",
        title: "La rutina da organización al sistema",
        summary: "Un día predecible exige menos al sistema sensorial.",
        text: "Cuando el día es predecible, el sistema sensorial suele estar menos exigido. Las transiciones inesperadas, los cambios bruscos o demasiados estímulos juntos pueden desorganizar mucho. La anticipación y la repetición ayudan a que el niño se sienta más preparado.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
    ],
  },
  {
    id: "alerta-fisica",
    title: "Cuando el cuerpo está en alerta",
    badge: "Entender lo físico también importa",
    desc: "Aprende a reconocer señales físicas de estrés y responder con acciones concretas.",
    tags: ["Chequeo rápido", "Señales físicas", "Acción inmediata"],
    priority: false,
    icon: "pulse",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        title: "Por qué el cuerpo reacciona primero",
        summary: "Muchas conductas difíciles tienen una base física, no solo de actitud.",
        text: "El cuerpo reacciona antes de que las palabras aparezcan. Muchas conductas difíciles tienen una base física relacionada con estrés, miedo o cansancio. Entender estas señales ayuda a responder con más empatía y con acciones que realmente ayuden.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: [],
        title: "Puntos clave para recordar",
        summary: "6 ideas centrales de este módulo.",
        items: [
          "El cuerpo tiene una alarma que se activa cuando percibe peligro.",
          "Respuestas comunes: pelear, huir o congelarse.",
          "Señales físicas: corazón rápido, dolor de estómago, manos tensas o respiración corta.",
          "Cuando el cuerpo está en alerta, es difícil pensar, escuchar o seguir instrucciones.",
          "Rutina de chequeo: agua, comida, baño, descanso y movimiento.",
          "El cuerpo vuelve a la calma cuando se siente seguro, acompañado y contenido.",
        ],
      },
      {
        kind: "articulo",
        renderType: "signals",
        age: [],
        title: "Lo que el cuerpo puede estar diciendo",
        summary: "Señales físicas a observar, y preguntas que ayudan a entender la causa.",
        text: "Cuando el cuerpo entra en alerta, puede actuar como si hubiera peligro aunque alrededor no se vea una amenaza clara. Por eso algunos niños reaccionan con enojo, llanto, bloqueo o impulsividad. No siempre es desobediencia. A veces primero hay que ayudar al cuerpo a sentirse seguro para que después el niño pueda escuchar, pensar y regularse mejor.",
        groupA: {
          label: "Señales a observar",
          tags: [
            "Corazón rápido",
            "Respiración corta",
            "Dolor de estómago",
            "Manos tensas",
            "Sudor o inquietud",
            "Llanto repentino",
            "Quedarse congelado",
            "Ganas de huir o esconderse",
          ],
        },
        groupB: {
          label: "Preguntas que ayudan",
          tags: [
            "¿Tiene hambre?",
            "¿Tiene sueño o cansancio?",
            "¿Necesita agua?",
            "¿Le duele algo?",
            "¿Hay demasiado ruido o estímulo?",
            "¿Algo le dio miedo o inseguridad?",
          ],
        },
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "pulse",
        title: "Chequeo rápido del cuerpo",
        summary: "El hambre puede hacer que el cuerpo se sienta más irritable o desregulado.",
        text: "El hambre puede hacer que el cuerpo se sienta más irritable, débil o desregulado. Antes de corregir, conviene revisar si necesita comer algo. ⚠️ NOTA: en la página original esta sección seguía con más puntos (sueño, agua, dolor, ruido, miedo) siguiendo el mismo patrón que las 'Preguntas que ayudan' de arriba, pero la captura se cortó ahí. Pedir al equipo el resto del contenido de este chequeo.",
      },
      {
        kind: "tip",
        renderType: "actionLists",
        age: [],
        title: "Qué hacer y qué decir",
        summary: "Pasos concretos y frases para practicar juntos.",
        colA: {
          title: "Qué hacer en el momento",
          items: [
            "Baja tu tono de voz y tu velocidad al hablar.",
            "Revisa necesidades básicas: agua, comida, baño, descanso.",
            "Reduce estímulos si el ambiente está muy cargado.",
            "Permite una pausa o movimiento suave.",
            "Habla con pocas palabras y mucha calma.",
            "Corrige después, cuando el cuerpo ya esté más tranquilo.",
          ],
        },
        colB: {
          title: "Frases útiles",
          items: [
            "Veo que tu cuerpo está muy tenso.",
            "Vamos a calmarnos primero.",
            "Respira conmigo, poco a poco.",
            "Primero ayudamos al cuerpo a sentirse seguro.",
            "No estás solo, estoy aquí contigo.",
          ],
        },
      },
    ],
  },
  {
    id: "no-escucha",
    title: "Cuando parece que no escucha",
    badge: "Cómo funciona el cerebro bajo estrés",
    desc: "Comprende por qué a veces no pueden pensar, aprender o responder como esperas.",
    tags: ["Trauma informado", "Comprensión", "Acompañamiento"],
    priority: false,
    icon: "brain",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        title: "Por qué el cerebro prioriza protegerse",
        summary: "No es que no quiera escuchar — está en modo supervivencia.",
        text: "Cuando el cerebro percibe amenaza o demasiado estrés, prioriza protegerse antes que pensar, aprender o cooperar. Esto no significa que el niño no quiera escuchar, sino que en ese momento su sistema está enfocado en sobrevivir y no en procesar instrucciones complejas.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: [],
        title: "Puntos clave para recordar",
        summary: "6 ideas centrales de este módulo.",
        items: [
          "El cerebro detecta peligro y activa el cuerpo para protegernos.",
          "Cuando hay mucho estrés, el cerebro reacciona más rápido de lo normal.",
          "Es difícil pensar, aprender o controlar emociones en ese estado.",
          "La conexión con un adulto seguro ayuda a calmar el cerebro.",
          "Las rutinas, el juego y la repetición ayudan a reconstruir seguridad.",
          "No es que el niño no quiera, es que su cerebro está en modo protección.",
        ],
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "warning",
        title: "El cerebro primero busca proteger",
        summary: "Puede parecer distraído o desafiante cuando en realidad está en alerta.",
        text: "Cuando un niño ha vivido trauma, abandono o mucho estrés, su cerebro puede reaccionar como si hubiera peligro aunque alrededor no lo parezca. En ese momento, lo más importante para su cerebro no es aprender, obedecer o explicar lo que siente, sino protegerse. Por eso puede parecer distraído, desafiante, bloqueado o como si no escuchara.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "puzzle",
        title: "Pensar y regularse se vuelve más difícil",
        summary: "No siempre es falta de voluntad — el cerebro no puede procesar bien.",
        text: "Bajo estrés, el cerebro tiene más dificultad para organizar ideas, seguir pasos, recordar indicaciones o controlar impulsos. Esto no siempre es falta de voluntad. Muchas veces el niño simplemente no puede procesar bien en ese momento. Entender esto ayuda a responder con empatía y no solo con corrección.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "handshake",
        title: "La conexión con un adulto regula",
        summary: "Corregir demasiado rápido puede aumentar la sensación de amenaza.",
        text: "Un adulto tranquilo puede ayudar al cerebro del niño a salir de ese estado de alerta. La cercanía, la voz calmada, la repetición y la presencia estable ayudan a que poco a poco recupere capacidad para pensar, escuchar y responder. Corregir demasiado rápido puede aumentar la sensación de amenaza.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "repeat",
        title: "La seguridad se reconstruye con repetición",
        summary: "Rutinas, juego y consistencia fortalecen su atención con el tiempo.",
        text: "El cerebro necesita experiencias repetidas de seguridad para aprender nuevas formas de reaccionar. Las rutinas, el juego, la anticipación y la consistencia ayudan a que el niño no viva todo como impredecible. Con el tiempo, eso fortalece su capacidad de poner atención y responder mejor.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
    ],
  },
  {
    id: "problemas-conducta",
    title: "Cuando hay problemas de conducta",
    badge: "Límites con conexión",
    desc: "Cómo poner reglas y sostener estructura sin romper el vínculo ni escalar el conflicto.",
    tags: ["Convivencia", "Límites claros", "Repetición"],
    priority: false,
    icon: "handshake",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        title: "Por qué los límites importan",
        summary: "Poner límites no es endurecerse — es ofrecer estructura segura.",
        text: "Las reglas son importantes, pero funcionan mejor cuando se presentan con claridad, consistencia y conexión. Poner límites no significa endurecerse, sino ofrecer estructura segura. La meta no es castigar, sino enseñar habilidades y convivencia.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: [],
        title: "Puntos clave para recordar",
        summary: "6 ideas centrales de este módulo.",
        items: [
          "Las reglas enseñan seguridad, no castigo.",
          "Frases clave: usa tus palabras, pide permiso, sé amable y espera tu turno.",
          "Los niños necesitan práctica y repetición, no solo corrección.",
          "Anticipar transiciones ayuda: avisar con tiempo y preparar cambios.",
          "Resolver conflictos implica escuchar, nombrar emoción y reparar.",
          "La consistencia del adulto crea confianza y estructura.",
        ],
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "shield",
        title: "Los límites ayudan a dar seguridad",
        summary: "Presentar las reglas como cuidado, no como control.",
        text: "Muchos niños que han vivido inestabilidad o trauma no interpretan las reglas como algo protector. A veces las sienten como rechazo o control. Por eso es clave presentar los límites como una forma de cuidado. Las reglas claras, simples y consistentes ayudan a que el niño entienda qué esperar y le dan estabilidad emocional.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "brain",
        title: "Corregir no es humillar",
        summary: "Atacar la identidad genera defensa — corregir sin dañar el vínculo enseña.",
        text: "Cuando hay una conducta difícil, el objetivo no es avergonzar ni etiquetar al niño, sino enseñarle. Frases que atacan la identidad generan defensa y desconexión. En cambio, corregir la conducta sin dañar el vínculo permite que el niño realmente aprenda.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "handshake",
        title: "Primero conexión, luego dirección",
        summary: "Bajar la intensidad emocional antes de dar la instrucción.",
        text: "Cuando el niño está alterado, exigir obediencia inmediata suele empeorar la situación. Primero es necesario bajar la intensidad emocional, luego dar la instrucción. Esto no significa quitar el límite, sino aplicarlo en el momento adecuado.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "repeat",
        title: "La repetición enseña más que el castigo",
        summary: "El castigo frena momentáneamente, pero no enseña la habilidad que falta.",
        text: "Los niños no cambian conductas solo porque se les explicó una vez. Necesitan práctica, acompañamiento y repetición. El castigo puede frenar momentáneamente, pero no enseña la habilidad que falta.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        icon: "puzzle",
        title: "Resolver y reparar también se aprende",
        summary: "Entender qué pasó y cómo reparar desarrolla responsabilidad emocional.",
        text: "Después de un conflicto, es importante ayudar al niño a entender qué pasó, cómo afectó a otros y cómo puede reparar. Esto desarrolla responsabilidad emocional y habilidades sociales.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
    ],
  },
  {
    id: "autonomia",
    title: "Desarrollar autonomía",
    badge: "Paso a paso en lo cotidiano",
    desc: "Rutinas y habilidades prácticas para fomentar seguridad, independencia y organización.",
    tags: ["Rutinas", "Autonomía", "Vida diaria"],
    priority: false,
    icon: "sprout",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: ["9-12", "13-15"],
        title: "Cómo se construye la autonomía",
        summary: "Poco a poco, con acompañamiento y expectativas realistas.",
        text: "La autonomía se construye poco a poco, con acompañamiento, práctica y expectativas realistas. No se trata de exigir perfección, sino de ayudar a desarrollar habilidades que fortalezcan la confianza, la responsabilidad y el sentido de capacidad personal.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: ["9-12", "13-15"],
        title: "Puntos clave para recordar",
        summary: "6 áreas para trabajar la autonomía.",
        items: [
          "Rutinas básicas: higiene, sueño y alimentación.",
          "Responsabilidades simples: ordenar, ayudar en casa y seguir pasos.",
          "Habilidades emocionales: pedir ayuda y expresar necesidades.",
          "Resolver problemas: pensar opciones y consecuencias.",
          "Relaciones: respeto, límites y comunicación.",
          "Preparación futura: decisiones, organización y metas.",
        ],
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["9-12", "13-15"],
        icon: "bathtub",
        title: "Rutinas básicas: higiene, sueño y alimentación",
        summary: "Horarios claros dan seguridad a niños que han vivido inestabilidad.",
        text: "Para muchos niños de 10 a 14 años que han vivido abandono o inestabilidad, las rutinas no son algo obvio. Tener horarios claros para bañarse, comer y dormir les ayuda a sentir seguridad, porque saben qué esperar durante el día. La meta no es imponer perfección, sino construir constancia poco a poco. Puede ayudar usar recordatorios visuales, listas sencillas o pasos cortos que hagan estas actividades más predecibles y menos abrumadoras.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["9-12", "13-15"],
        icon: "basket",
        title: "Responsabilidades simples: ordenar, ayudar en casa y seguir pasos",
        summary: "Las responsabilidades pequeñas fortalecen el sentido de capacidad y pertenencia.",
        text: "Las responsabilidades pequeñas ayudan a fortalecer el sentido de capacidad y pertenencia. Actividades como tender la cama, guardar ropa, preparar una mochila o ayudar a poner la mesa permiten que el niño vea que sí puede contribuir. En esta etapa es importante dar instrucciones concretas, dividir tareas en pasos y reconocer el esfuerzo más que el resultado perfecto. La responsabilidad debe sentirse como una oportunidad de crecer, no como castigo.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["9-12", "13-15"],
        icon: "brain",
        title: "Habilidades emocionales: pedir ayuda y expresar necesidades",
        summary: "Frases sencillas como 'necesito un momento' ayudan a expresar lo que sienten.",
        text: "La autonomía también incluye saber identificar lo que uno siente y comunicarlo. Muchos niños con experiencias difíciles pueden reaccionar con enojo, aislamiento o silencio porque no saben cómo expresar lo que necesitan. Por eso, es útil enseñar frases sencillas como 'necesito un momento', 'me siento enojado' o 'quiero ayuda'. Cuando un adulto escucha sin juzgar y pone nombre a las emociones, el niño aprende que expresar lo que le pasa es seguro y válido.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["9-12", "13-15"],
        icon: "brain",
        title: "Resolver problemas: pensar opciones y consecuencias",
        summary: "Un proceso simple: detenerse, entender, pensar opciones y sus consecuencias.",
        text: "Resolver problemas no siempre surge de forma natural, especialmente cuando un niño ha vivido situaciones de estrés constante. Por eso conviene enseñar un proceso simple: detenerse, entender qué pasó, pensar dos o tres opciones y revisar qué podría pasar con cada una. Esto les ayuda a no reaccionar solo desde el impulso. Practicar con ejemplos cotidianos, como conflictos con amigos, tareas o reglas del hogar, puede hacer que esta habilidad se vuelva más natural con el tiempo.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["9-12", "13-15"],
        icon: "handshake",
        title: "Relaciones: respeto, límites y comunicación",
        summary: "Entender que una regla no significa rechazo, sino cuidado, puede tomar tiempo.",
        text: "Aprender autonomía también implica convivir con otros de manera sana. En esta edad, es importante trabajar el respeto, el espacio personal, la escucha y la comunicación clara. Los límites ayudan a crear seguridad cuando son consistentes y se explican con calma. Para niños con trauma, entender que una regla no significa rechazo, sino cuidado, puede tomar tiempo. Por eso es importante que el adulto modele formas respetuosas de hablar, corregir y reparar cuando hay conflicto.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
      {
        kind: "articulo",
        renderType: "text",
        age: ["9-12", "13-15"],
        icon: "target",
        title: "Preparación futura: decisiones, organización y metas",
        summary: "Tomar pequeñas decisiones fortalece la confianza en su propio control.",
        text: "Entre los 10 y 14 años también es importante empezar a desarrollar organización personal y visión de futuro. Esto puede incluir usar una agenda, planear tareas, elegir entre opciones sencillas o proponerse metas alcanzables. Muchos niños que han vivido experiencias difíciles pueden sentir que no tienen control sobre su vida, por lo que enseñarles a tomar pequeñas decisiones fortalece su confianza. Las metas deben ser concretas, realistas y acompañadas por un adulto que guíe sin resolver todo por ellos.",
        tip: "⚠️ FALTA — pedir texto real de la sugerencia práctica.",
      },
    ],
  },
  {
    id: "herramientas-digitales",
    title: "Herramientas digitales para el futuro",
    badge: "Recursos complementarios",
    desc: "Aprendizajes digitales básicos para apoyar tareas, organización y uso seguro de internet.",
    tags: ["Complementario", "Práctico", "Futuro"],
    priority: false,
    icon: "laptop",
    age: [],
    gender: ["todos"],
    pieces: [
      {
        kind: "articulo",
        renderType: "text",
        age: [],
        title: "Para qué sirve este módulo",
        summary: "Las habilidades digitales también apoyan el desarrollo y la autonomía.",
        text: "Las habilidades digitales también pueden ser una herramienta útil para apoyar el desarrollo y la autonomía. Este módulo reúne recursos sencillos para aprender a usar herramientas básicas de computadora y navegar internet de forma más segura.",
      },
      {
        kind: "checklist",
        renderType: "checklist",
        age: [],
        title: "Puntos clave para recordar",
        summary: "6 habilidades digitales básicas.",
        items: [
          "Uso básico de computadora y organización de archivos.",
          "Word: escribir tareas, cartas y documentos.",
          "PowerPoint: expresar ideas con presentaciones.",
          "Excel: listas y presupuestos simples.",
          "Uso seguro de internet.",
          "Aprender haciendo con proyectos prácticos.",
        ],
      },
      {
        kind: "video",
        renderType: "video",
        age: [],
        title: "Uso básico de computadora y organización de archivos",
        summary: "Video: curso de computación básica para principiantes.",
        videoTitle: "Curso de computación básica para principiantes. Aprende a usar un computador desde cero",
        channel: "Informática en la Web",
        videoUrl:
          "⚠️ FALTA — no tengo el link de YouTube, pedir al equipo. Los otros 4 puntos del checklist (Word, PowerPoint, Excel, uso seguro de internet) probablemente también tienen su propio video en la página original — pedir esos también si existen.",
      },
    ],
  },
];

async function main() {
  loadEnvLocal();

  const { auth, db } = await import("../src/lib/firebase");

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (email && password) {
    await signInWithEmailAndPassword(auth, email, password);
    console.log(`Sesión iniciada como ${email}`);
  } else {
    console.log(
      "SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD no definidos; escribiendo sin sesión (fallará si las reglas de Firestore exigen auth).",
    );
  }

  // PASO 0: borra cualquier dato de la implementación anterior (modules,
  // pieces y el viejo modelo plano de posts).
  for (const collectionName of ["modules", "pieces", "posts"]) {
    const snapshot = await getDocs(collection(db, collectionName));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
    console.log(`Borrados ${snapshot.size} documentos viejos de "${collectionName}".`);
  }

  // Inserta los 8 módulos reales + sus piezas.
  for (const [moduleIndex, mod] of MODULES.entries()) {
    const { pieces, ...moduleData } = mod;
    await setDoc(doc(db, "modules", mod.id), {
      ...moduleData,
      order: moduleIndex + 1,
    });
    console.log(`Módulo creado: "${mod.title}" (${mod.id})`);

    for (const [pieceIndex, piece] of pieces.entries()) {
      const ref = await addDoc(collection(db, "pieces"), {
        ...piece,
        gender: piece.gender ?? ["todos"],
        moduleId: mod.id,
        order: pieceIndex + 1,
      });
      console.log(`  Pieza creada: "${piece.title}" (${ref.id})`);
    }
  }

  console.log(
    `Listo. ${MODULES.length} módulos y ${MODULES.reduce((n, m) => n + m.pieces.length, 0)} piezas creadas.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Error al sembrar datos:", err instanceof Error ? err.message : err);
  console.error(
    "Si es un error de permisos, corre con las credenciales del panel admin:\n" +
      "  SEED_ADMIN_EMAIL=correo SEED_ADMIN_PASSWORD=contraseña npx tsx scripts/seed-modules.ts",
  );
  process.exit(1);
});
