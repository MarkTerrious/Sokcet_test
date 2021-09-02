const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv');

const nunjucks = require('nunjucks');

dotenv.config();
const webSocket = require('./socket');
const indexRouter = require('./routes');

// 서버 환경설정
const app = express();
app.set('port', process.env.PORT || 8005);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express : app,
  watch : true,
});

// 서버 미들웨어 등록
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded( {extended : false }));  // 문자열 쿼리 해석 방식
app.use(cookieParser(process.env.COOKIE_SECRET));   // signed 쿠키를 만든다.
app.use(session({                                   // signed 쿠키를 client에 보낸다.
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  }
}));

app.use('/', indexRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 존재 하지 않습니다.`)
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err: {},
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}로 서버 실행 중..`);
});

webSocket(server);

