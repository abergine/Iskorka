'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import styles from './styles/Booking.module.css';
import { useEffect, useState } from 'react';


interface Seat {
  id: number;
  row: number;
  number: number;
  status: 'available' | 'booked' | 'selected';
}

const MAX_SEATS = 5;


export default function Booking() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const movieId = searchParams.get('movieId');
    const time = searchParams.get('time');
    const changeBooking = searchParams.get('changeBooking');
    const [seats, setSeats] = useState<Seat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [isChangingBooking, setIsChangingBooking] = useState(false);

  useEffect(() => {
    const changeBooking = searchParams.get('changeBooking');
    setIsChangingBooking(changeBooking === 'true');
    
    const fetchSeats = async () => {
      setIsLoading(true);
      setError(null);
      setError(null);
      try {
        const savedSeats = localStorage.getItem(`seats_${movieId}_${time}`);
        if (savedSeats) {
          setSeats(JSON.parse(savedSeats));
        } else {
          const mockSeats: Seat[] = Array.from({ length: 50 }, (_, index) => ({
            id: index + 1,
            row: Math.floor(index / 10) + 1,
            number: (index % 10) + 1,
            status: Math.random() > 0.8 ? 'booked' : 'available',
          }));
          setSeats(mockSeats);
          localStorage.setItem(`seats_${movieId}_${time}`, JSON.stringify(mockSeats));
        }

        // Fetch available times (mock data)
        setAvailableTimes(['10:00', '13:00', '16:00', '19:00', '22:00']);

        // Проверяем, изменяется ли существующее бронирование
        setIsChangingBooking(changeBooking === 'true');

        if (changeBooking === 'true') {
          // Загружаем текущее бронирование и выбираем соответствующие места
          const currentBooking = JSON.parse(localStorage.getItem(`booking_${movieId}_${time}`) || '{}');
          if (currentBooking.seats) {
            setSeats(prevSeats => prevSeats.map(seat => 
              currentBooking.seats.some((bookedSeat: any) => bookedSeat.row === seat.row && bookedSeat.number === seat.number)
                ? { ...seat, status: 'selected' }
                : seat
            ));
          }
        }
      } catch (error) {
        console.error('Error fetching seats:', error);
        setError('Не удалось загрузить данные о местах');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
}, [movieId, time, changeBooking]);

  const handleSeatClick = (seatId: number) => {
    setSeats(prevSeats => {
      const newSeats = prevSeats.map(s => {
        if (s.id === seatId) {
          if (s.status === 'booked') return s;
          if (s.status === 'available' && prevSeats.filter(seat => seat.status === 'selected').length >= MAX_SEATS) {
            alert(`Вы можете выбрать не более ${MAX_SEATS} мест`);
            return s;
          }
          return { ...s, status: s.status === 'selected' ? 'available' : 'selected' };
        }
        return s;
      });
      localStorage.setItem(`seats_${movieId}_${time}`, JSON.stringify(newSeats));
      return newSeats;
    });
  };

  const handleBooking = async () => {
    const selectedSeats = seats.filter(seat => seat.status === 'selected');
    if (selectedSeats.length === 0) {
      alert('Пожалуйста, выберите места для бронирования');
      return;
    }
    try {
      if (isChangingBooking) {
        // Отменяем старое бронирование
        const oldBooking = JSON.parse(localStorage.getItem(`booking_${movieId}_${time}`) || '{}');
        if (oldBooking.seats) {
          setSeats(prevSeats => prevSeats.map(seat => 
            oldBooking.seats.some((bookedSeat: any) => bookedSeat.row === seat.row && bookedSeat.number === seat.number)
              ? { ...seat, status: 'available' }
              : seat
          ));
        }
        localStorage.removeItem(`booking_${movieId}_${time}`);
      }
  
      // Сохраняем информацию о бронировании
      const bookingData = {
        movieId,
        time,
        seats: selectedSeats.map(seat => ({ row: seat.row, number: seat.number }))
      };
      const bookingKey = `booking_${movieId}_${time}`;
      localStorage.setItem(bookingKey, JSON.stringify(bookingData));
      console.log('Saved booking:', bookingKey, bookingData);
  
      alert(`Забронированы места: ${selectedSeats.map(seat => `${seat.row}-${seat.number}`).join(', ')}`);
      
      setSeats(prevSeats => {
        const newSeats = prevSeats.map(seat =>
          seat.status === 'selected' ? { ...seat, status: 'booked' } : seat
        );
        localStorage.setItem(`seats_${movieId}_${time}`, JSON.stringify(newSeats));
        return newSeats;
      });
  
      // Перенаправляем на страницу с бронированиями
      router.push('./my_booking');
    } catch (error) {
      console.error('Error booking seats:', error);
      alert('Произошла ошибка при бронировании мест');
    }
  };
  
  // Добавьте кнопку для отмены изменения бронирования
  const handleCancelChange = () => {
    if (window.confirm('Вы уверены, что хотите отменить изменение бронирования?')) {
      router.push('./my_booking');
    }
  };


  const handleChangeTime = (newTime: string) => {
    if (newTime === time) return;

    const selectedSeats = seats.filter(seat => seat.status === 'selected');
    if (selectedSeats.length > 0) {
      const confirmChange = window.confirm('У вас есть выбранные места. Вы уверены, что хотите изменить время? Ваш текущий выбор будет сброшен.');
      if (!confirmChange) return;
    }

    // Reset current selection
    setSeats(prevSeats => {
      const resetSeats = prevSeats.map(seat =>
        seat.status === 'selected' ? { ...seat, status: 'available' } : seat
      );
      localStorage.setItem(`seats_${movieId}_${time}`, JSON.stringify(resetSeats));
      return resetSeats;
    });

    // Navigate to the new time
    router.push(`/booking?movieId=${movieId}&time=${newTime}`);
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

 
  return (
    <>

      <div className={styles.bookingContainer}>
      <h1>{isChangingBooking ? 'Изменение бронирования' : 'Выбор мест'}</h1>
      <p>Фильм ID: {movieId}</p>
      <p>Время сеанса: {time}</p>


      <div className={styles.timesContainer}>
        <h2>Доступные сеансы:</h2>
        {availableTimes.map((availableTime) => (
          <button
            key={availableTime}
            onClick={() => handleChangeTime(availableTime)}
            className={`${styles.timeButton} ${availableTime === time ? styles.activeTime : ''}`}
          >
            {availableTime}
          </button>
        ))}
      </div>

      <div className={styles.screenContainer}>
        <div className={styles.screen}> </div>
      </div>

      <div className={styles.seatsContainer}>
        {Array.from({ length: 5 }, (_, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {seats
              .filter(seat => seat.row === rowIndex + 1)
              .map(seat => (
                <button
                  key={seat.id}
                  className={`${styles.seat} ${styles[seat.status]}`}
                  onClick={() => handleSeatClick(seat.id)}
                  disabled={seat.status === 'booked'}
                  aria-label={`Место ${seat.row}-${seat.number}, ${
                    seat.status === 'available' ? 'доступно' : seat.status === 'selected' ? 'выбрано' : 'занято'
                  }`}
                >
                  {seat.number}
                </button>
              ))}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.available}`}></div>
          <span>Доступно</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.selected}`}></div>
          <span>Выбрано</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.booked}`}></div>
          <span>Занято</span>
        </div>
      </div>

      <p className={styles.info}>
        Выбрано мест: {seats.filter(seat => seat.status === 'selected').length} из {MAX_SEATS}
      </p>

      <button 
        className={styles.bookButton} 
        onClick={handleBooking}
        disabled={!seats.some(seat => seat.status === 'selected')}
      >
        {isChangingBooking ? 'Подтвердить изменения' : 'Забронировать выбранные места'}
      </button>

      {isChangingBooking && (
        <button 
          className={styles.cancelChangeButton} 
          onClick={handleCancelChange}
        >
          Отменить изменение
        </button>
      )}
  </div>
    </>
  );
}