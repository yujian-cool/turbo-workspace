# nginx镜像compose/nginx/Dockerfile

FROM nginx:alpine

# 删除原有配置文件，创建静态资源文件夹和ssl证书保存文件夹
RUN rm /etc/nginx/conf.d/default.conf \
    && mkdir -p /usr/share/nginx/ssl

# 关闭守护模式
CMD ["nginx", "-g", "daemon off;"]