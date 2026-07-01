# 🛒 ScanPrice

> Escanea el código de barras de un producto y compara su precio entre supermercados al instante.

Proyecto nacido como Trabajo Final de Ingeniería de Sistemas de Información, evolucionado hasta convertirse en una aplicación full-stack con infraestructura AWS desplegada de forma profesional (VPC segmentada, CI/CD con OIDC, contenedores en EC2, CDN con S3+CloudFront).

![TypeScript](https://img.shields.io/badge/TypeScript-80%25-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3%20%7C%20RDS%20%7C%20CloudFront-FF9900?logo=amazonaws&logoColor=white)

<!-- Añadir video demo -->

---

## Índice

- [¿Qué hace?](#qué-hace)
- [Arquitectura](#arquitectura)
- [El reto de datos](#el-reto-de-datos)
- [Stack técnico](#stack-técnico)
- [CI/CD y despliegue en AWS](#cicd-y-despliegue-en-aws)
- [Decisiones técnicas y trade-offs](#decisiones-técnicas-y-trade-offs)
- [Limitaciones y próximos pasos](#limitaciones-y-próximos-pasos)
- [Cómo ejecutarlo en local](#cómo-ejecutarlo-en-local)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## ¿Qué hace?

1. El usuario escanea un código de barras con la cámara (o lo introduce manualmente).
2. La app busca el producto en la base de datos centralizada y muestra productos similares en todos los supermercados.
3. Si el producto no existe, el usuario puede darlo de alta mediante un formulario, que queda como sugerencia pendiente de confirmar por el administrador.
4. Los precios se mantienen actualizados mediante scraping periódico de las distintas fuentes.

## Arquitectura

<!-- Añadir esquema arquitectura -->

- **Frontend**: build estático subido a S3, servido vía CloudFront (bucket 100% privado, acceso solo por OAC).
- **Backend**: contenedor Docker en EC2 detrás de Nginx, dentro de una VPC con subred pública.
- **Base de datos**: RDS PostgreSQL en subred **privada**, sin acceso público, solo alcanzable desde el security group del backend.
- **Red**: VPC con 2 zonas de disponibilidad para failover, sin NAT Gateway (las subredes privadas no necesitan salida a internet).
- **HTTPS sin dominio propio**: CloudFront actúa también como proxy hacia el backend (`/api/*` con caché deshabilitada), evitando exponer HTTP plano.

## El reto de datos

La parte más interesante del proyecto no es el CRUD, es la **normalización de datos sucios de tres fuentes heterogéneas**:

| Fuente | Tipo | Ejemplo del problema |
|---|---|---|
| Mercadona | Scraping directo | Nombres con marca, gramaje y adjetivos mezclados |
| API pública de precios | API REST | Formato y granularidad distintos a los scrapers |
| Dia / CSV | Fichero CSV | Datos estáticos, sin estructura homogénea |

Un mismo producto (p. ej. "pechuga de pollo") puede llegar como `"Pechuga de pollo Hacendado 500g"` desde una fuente y `"Filete de pechuga de pollo Día 0.5kg"` desde otra. Para unificarlos:

1. Los productos sin normalizar se agrupan en **lotes de 200** y se envían a la API de Gemini con un prompt que normaliza los productos y reutiliza los nombres normalizados ya creados.
2. El proceso es **offline y por lotes**, no en tiempo real por request, lo que reduce coste y latencia, y evita depender de un LLM en el camino crítico de cada búsqueda del usuario.
3. El resultado se incluye en la tabla `normalized_names` que actúa de diccionario canónico, referenciada desde `products` vía FK.

Esto convierte un problema de "scraping" en un problema real de **integración y calidad de datos**, que es justo lo que lo distingue de un proyecto CRUD típico.

## Stack técnico

**Frontend** — React 19 + Vite + TypeScript, escaneo de códigos de barras con `@ericblade/quagga2`.

**Backend** — Node.js + Express 5, validación de inputs con **Zod**, `helmet` para cabeceras de seguridad, `pg` como cliente de PostgreSQL. Arquitectura en capas: controllers finos, lógica de negocio en services.

**Scraper** — servicio independiente en TypeScript, `@google/generative-ai` (Gemini) para normalización, `csv-parse` para ingesta de ficheros, ejecutable vía cron o EventBridge.

**Infraestructura** — AWS (S3, CloudFront, EC2, RDS, ECR, VPC, IAM), Docker, GitHub Actions.

## CI/CD y despliegue en AWS

Dos workflows independientes, cada uno disparado solo cuando cambian los paths que le afectan:

- **`frontend.yml`** — build con Vite → `aws s3 sync` → invalidación de CloudFront.
- **`backend.yml`** — build de imagen Docker → push a ECR → deploy en EC2 vía SSH (`docker compose up -d`) con rotación de logs y limpieza de imágenes antiguas.

Ambos se autentican en AWS mediante **OIDC** (`aws-actions/configure-aws-credentials`), sin credenciales estáticas en secrets: GitHub emite un JWT de corta duración, AWS lo verifica contra un Identity Provider configurado para confiar solo en este repositorio, y devuelve credenciales temporales que expiran en una hora.

## Decisiones técnicas y trade-offs

Estas son las decisiones, a nuestro juicio, más importantes del proyecto:

- **OIDC en vez de access keys en secrets** — elimina el riesgo de credenciales de larga duración filtradas; el coste es una configuración inicial más compleja (Identity Provider + trust policy).
- **Sin NAT Gateway** — ahorra un coste fijo mensual relevante para un proyecto universitario; el trade-off es que las subredes privadas (RDS) no tienen salida a internet, lo cual es aceptable porque no la necesitan.
- **Normalización offline por lotes con Gemini vs. en tiempo real** — procesar 200-300 productos por llamada reduce drásticamente el coste por producto y evita que la aplicación dependa de la latencia con el LLM, lo que haría que hubiese una experiencia de usuario pésima.
- **CloudFront como proxy del backend sin dominio propio** — al no tener un dominio para certificado TLS directo en EC2, se reutiliza la distribución de CloudFront como origen HTTPS hacia `/api/*`, evitando servir la API en HTTP plano.
- **Credenciales de RDS autoadministradas en vez de Secrets Manager** — decisión consciente de velocidad de desarrollo sobre práctica ideal, documentada como mejora pendiente en vez de ocultada.
- **Regla SSH restringida a IP fija en vez de VPN** — sin presupuesto para una VPN gestionada, se acepta el coste operativo de actualizar la regla manualmente en cada cambio de red.

## Limitaciones y próximos pasos

Siendo honestos sobre el alcance: al ser un proyecto que empezó como universitario con tiempo y recursos limitados, no pudimos integrar el scraping de todos los supermercados que nos hubiese gustado. Esto hace que la cobertura de comparación de precios sea menor de la que tendría la aplicación en un escenario ideal — con más fuentes scrapeadas, la comparativa sería mucho más completa y la utilidad real de la app aumentaría notablemente.

Otras mejoras identificadas y pendientes:

- [ ] Ampliar el scraping a más cadenas de supermercados
- [ ] Mover credenciales de RDS a AWS Secrets Manager
- [ ] Añadir reglas personalizadas de WAF en CloudFront
- [ ] Sustituir la regla SSH por acceso vía VPN o SSM Session Manager
- [ ] Infraestructura como código (Terraform / CDK) en vez de configuración manual
- [ ] Dominio propio con certificado ACM para el backend

## Cómo ejecutarlo en local

```bash
# Instalar dependencias del monorepo
pnpm install

# Levantar solo PostgreSQL en Docker
pnpm dev:db

# Levantar frontend + backend en modo desarrollo
pnpm dev

# O ambos pasos anteriores en un solo comando
pnpm dev:full

# Compilar el scraper y normalizador
cd packages/scraper && pnpm build

# Ejecutar el scraper manualmente desde packages/scraper
pnpm start

# Ejecutar el normalizador manualmente desde packages/scraper
node dist/services/normalizator.service.js

```

Cada paquete (`frontend`, `backend`, `scraper`) tiene su propio `.env.example` — copia a `.env` y rellena las variables necesarias (conexión a PostgreSQL, API key de Gemini, etc.).

## Estructura del proyecto

```
ScanPrice/
├── .github/workflows/       # CD: frontend.yml, backend.yml
├── packages/
│   ├── frontend/             # React + Vite
│   ├── backend/               # Express + Zod + pg
│   └── scraper/                # Scrapers + normalización con Gemini
├── docker/
│   ├── docker-compose.dev.yml   # PostgreSQL local
│   └── docker-compose.prod.yml  # Backend en EC2
└── pnpm-workspace.yaml
```

---

## Autor

Proyecto desarrollado por: 
  - Claudio Rivas
  - Yeray Fernández