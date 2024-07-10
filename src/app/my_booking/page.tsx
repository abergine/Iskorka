'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/MyBookings.module.css';
import Link from 'next/link';

interface Booking {
    id: string;
    movieId: string;
    movieTitle: string;
    time: string;
    seats: { row: number; number: number }[];
}

const ITEMS_PER_PAGE = 5; // Количество бронирований на странице

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    console.log('localStorage keys:', Object.keys(localStorage));
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    console.log('All localStorage keys:', Object.keys(localStorage));
    const bookingKeys = Object.keys(localStorage).filter(key => key.startsWith('booking_'));
    console.log('Booking keys:', bookingKeys);

    setIsLoading(true);
    setError(null);
    try {
      const localBookings = bookingKeys.map(key => {
        const [, movieId, time] = key.split('_');
        const bookingDataString = localStorage.getItem(key);
        if (bookingDataString) {
          try {
            const bookingData = JSON.parse(bookingDataString);
            console.log('Parsed booking data:', bookingData);
            return {
              id: key, // используем ключ как id
              movieId,
              movieTitle: 'Movie Title', // здесь вы можете добавить логику для получения названия фильма
              time,
              seats: bookingData.seats || [],
            };
          } catch (error) {
            console.error(`Error parsing booking data for key ${key}:`, error);
            return null; // возвращаем null для бронирований, которые не удалось распарсить
          }
        } else {
          console.log(`No data found for key ${key}`);
          return null; // возвращаем null для отсутствующих данных
        }
      }).filter(booking => booking !== null) as Booking[]; // фильтруем null значения

      console.log('Local bookings before setState:', localBookings);
      setBookings(localBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Не удалось загрузить данные о бронированиях');
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancelBooking = async (booking: Booking) => {
    if (window.confirm('Вы уверены, что хотите отменить эту бронь?')) {
      try {
        // Удаляем бронирование из localStorage
        localStorage.removeItem(booking.id);
  
        // Обновляем состояние, удаляя отмененное бронирование
        setBookings(prevBookings => prevBookings.filter(b => b.id !== booking.id));
  
        // Обновляем статус мест в localStorage
        const seatsKey = `seats_${booking.movieId}_${booking.time}`;
        const seatsData = localStorage.getItem(seatsKey);
        if (seatsData) {
          const seats = JSON.parse(seatsData);
          const updatedSeats = seats.map((seat: any) => {
            if (booking.seats.some(bookedSeat => bookedSeat.row === seat.row && bookedSeat.number === seat.number)) {
              return { ...seat, status: 'available' };
            }
            return seat;
          });
          localStorage.setItem(seatsKey, JSON.stringify(updatedSeats));
        }
  
        alert('Бронирование успешно отменено');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Произошла ошибка при отмене брони');
      }
    }
  };

  
  const handleChangeSession = async (booking: Booking) => {
    if (window.confirm('Вы уверены, что хотите изменить сеанс? Текущее бронирование будет отменено.')) {
      try {
        // Удаляем текущее бронирование из localStorage
        localStorage.removeItem(booking.id);
  
        // Обновляем статус мест в localStorage
        const seatsKey = `seats_${booking.movieId}_${booking.time}`;
        const seatsData = localStorage.getItem(seatsKey);
        if (seatsData) {
          const seats = JSON.parse(seatsData);
          const updatedSeats = seats.map((seat: any) => {
            if (booking.seats.some(bookedSeat => bookedSeat.row === seat.row && bookedSeat.number === seat.number)) {
              return { ...seat, status: 'available' };
            }
            return seat;
          });
          localStorage.setItem(seatsKey, JSON.stringify(updatedSeats));
        }
  
        // Обновляем состояние, удаляя измененное бронирование
        setBookings(prevBookings => prevBookings.filter(b => b.id !== booking.id));
  
        // Перенаправляем на страницу бронирования для выбора нового времени
        router.push(`/booking?movieId=${booking.movieId}&changeTime=true`);
      } catch (error) {
        console.error('Error changing session:', error);
        alert('Произошла ошибка при изменении сеанса');
      }
    }
  };

  useEffect(() => {
    console.log('Bookings updated:', bookings);
  }, [bookings]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  const pageCount = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (

    <div className={styles.container}>

<div className={styles.topRightButtons}>
        <Link href="/" className={styles.button}>
          Главная
        </Link>
        <Link href="/my_booking" className={styles.button}>
          Бронь
        </Link>
      </div>
      
      <h1 className={styles.title}>Мои бронирования</h1>

  
      {bookings.length === 0 ? (
        <p>У вас нет активных бронирований.</p>
      ) : (
        <>
          <ul className={styles.bookingList}>
            {currentBookings.map(booking => (
              <li key={booking.id} className={styles.bookingItem}>
                <div className={styles.bookingInfo}>
                  <h2>{booking.movieTitle}</h2>
                  <p>Время сеанса: {booking.time}</p>
                  <p>Места: {booking.seats.map(seat => `${seat.row}-${seat.number}`).join(', ')}</p>
                </div>
                <div className={styles.bookingActions}>
                  <button
                    onClick={() => handleChangeSession(booking)}
                    className={styles.changeButton}
                  >
                    Изменить сеанс
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking)}
                    className={styles.cancelButton}
                  >
                    Отменить бронь
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.pagination}>
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}