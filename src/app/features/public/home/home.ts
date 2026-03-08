import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [RouterLink],
})
export default class HomePage {
  features = [
    {
      icon: '🔬',
      title: 'Research Lines',
      description:
        'Структурируйте исследование на фазы с последовательным выполнением и чёткими целями.',
    },
    {
      icon: '📋',
      title: 'Step-by-Step Log',
      description:
        'Каждое действие фиксируется в лабораторном журнале с неизменяемыми временными метками.',
    },
    {
      icon: '🔒',
      title: 'Immutability',
      description:
        'Отправленные шаги и артефакты становятся ReadOnly — аудит гарантирован.',
    },
    {
      icon: '📂',
      title: 'Artifacts & Evidence',
      description:
        'Прикрепляйте файлы, фото, код и конфиги с проверкой целостности SHA-256.',
    },
    {
      icon: '🎯',
      title: 'Objectives Tracking',
      description:
        'Определите критерии успеха заранее и отслеживайте их выполнение.',
    },
    {
      icon: '📱',
      title: 'Mobile Lab',
      description:
        'Ведите журнал прямо с телефона — быстрый ввод и загрузка фото с камеры.',
    },
  ];

  workflowSteps = [
    {
      step: 1,
      title: 'Планирование',
      description:
        'Создайте проект, добавьте Research Lines, определите Objectives и последовательность шагов. Все данные редактируемы на этом этапе.',
    },
    {
      step: 2,
      title: 'Лабораторная работа',
      description:
        'Активируйте Research Line, добавляйте записи в реальном времени, прикрепляйте артефакты и отправляйте шаги.',
    },
    {
      step: 3,
      title: 'Завершение',
      description:
        'Когда все Objectives оценены и шаги отправлены — Research Line получает статус COMPLETED. Данные больше нельзя изменить.',
    },
  ];
}
