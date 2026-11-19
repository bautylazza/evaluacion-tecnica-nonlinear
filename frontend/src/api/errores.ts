export class ErrorApi extends Error {
  status: number;

  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.status = status;
  }
}

type ProblemDetail = {
  detail?: string;
};

export async function crearErrorApi(respuesta: Response): Promise<ErrorApi> {
  const mensajePorDefecto = `Error ${respuesta.status} al comunicarse con el servidor`;
  try {
    const problema: ProblemDetail = await respuesta.json();
    return new ErrorApi(problema.detail ?? mensajePorDefecto, respuesta.status);
  } catch {
    return new ErrorApi(mensajePorDefecto, respuesta.status);
  }
}
