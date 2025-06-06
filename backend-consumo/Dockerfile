# Imagen base de Node.js
FROM node:18

# Crear el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto (DB, server.js, carpetas, etc.)
COPY . .

# Exponer el puerto (ajústalo si tu server escucha en otro)
EXPOSE 3000

# Comando para lanzar el servidor
CMD ["node", "server.js"]
