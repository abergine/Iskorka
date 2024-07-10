// app/page.tsx

import Head from 'next/head';
import styles from './styles/Home.module.css';
import Link from 'next/link';


interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  showtimes: string[];
}

async function fetchMovies(): Promise<Movie[]> {
  // Здесь вы можете сделать запрос к API для получения данных о фильмах.
  // Пример с фейковыми данными:
  return [
    {
      id: 1,
      title: 'Барби (feat.)',
      description: 'Комедия, реверс',
      posterUrl: '/f1.jpg',
      showtimes: ['10:00', '13:00', '16:00' , '19:00' , '22:00'],
    },
    {
      id: 2,
      title: 'Головоломка 2',
      description: 'Комедия, психология',
      posterUrl: '/f2.jpg',
      showtimes: ['10:00', '13:00', '16:00' , '19:00' , '22:00'],
    },
    {
      id: 3,
      title: 'Гарри Поттер: Узник Узкабана',
      description: 'Магия, драма',
      posterUrl: '/f3.jpg',
      showtimes: ['10:00', '13:00', '16:00' , '19:00' , '22:00'],
    },
    {
      id: 4,
      title: 'Интерстеллар',
      description: 'Утопия, наука',
      posterUrl: '/f4.jpg',
      showtimes: ['10:00', '13:00', '16:00' , '19:00' , '22:00'],
    },
    {
      id: 5,
      title: 'Как стать принцессой',
      description: 'Комедия, повседневность',
      posterUrl: '/f5.jpg',
      showtimes: ['10:00', '13:00', '16:00' , '19:00' , '22:00'],
    },
  ];
}

export default async function Home() {
  const movies = await fetchMovies();
  const shouldStack = movies.length > 4; // Определяем, нужно ли отображать карточки в столбец

  return (
    <div className={styles.container}>
      <Head>
        <title>Кинотеатр Искорка</title>
        <meta name="description" content="Добро пожаловать в кинотеатр Искорка! Смотрите новинки кино у нас." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.topRightButtons}>
        <Link href="/" className={styles.button}>
          Главная
        </Link>
        <Link href="/my_booking" className={styles.button}>
          Бронь
        </Link>
      </div>

      <main className={styles.main}>
        <h1 className={styles.title}>Искорка</h1>

        <div className={`${styles.grid} ${shouldStack ? styles.stacked : ''}`}>
          {movies.map(movie => (
            <div key={movie.id} className={styles.card}>
              <img src={movie.posterUrl} alt={movie.title} className={styles.posterImage} />
              <h2>{movie.title}</h2>
              <p>{movie.description}</p>
              <h3>Расписание сеансов:</h3>
              <div>
                {movie.showtimes.map((time, index) => (
                  <Link
                    key={index}
                    href={`/booking?movieId=${movie.id}&time=${time}`}
                    className={styles['showtime-button']}
                  >
                    {time}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}