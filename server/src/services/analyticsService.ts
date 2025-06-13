import { PrismaClient } from '@prisma/client';
import Mixpanel from 'mixpanel';
import { AnalyticsEvent } from '../types';

export class AnalyticsService {
  private mixpanel?: Mixpanel.Mixpanel;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    
    if (process.env.MIXPANEL_TOKEN) {
      this.mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
    } else {
      console.warn('Mixpanel token not provided, analytics will be stored locally only');
    }
  }

  async track(eventName: string, userId?: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventName,
      userId,
      properties: properties || {}
    };

    try {
      // Store in database
      await this.prisma.analyticsEvent.create({
        data: {
          eventName: event.eventName,
          userId: event.userId,
          properties: event.properties
        }
      });

      // Send to Mixpanel if available
      if (this.mixpanel && userId) {
        this.mixpanel.track(eventName, {
          distinct_id: userId,
          ...properties
        });
      }

      console.log(`📊 Analytics: ${eventName}`, { userId, properties });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  async trackClick(userId: string, element: string, page: string, properties?: Record<string, any>) {
    await this.track('click', userId, {
      element,
      page,
      ...properties
    });
  }

  async trackQuestionView(userId: string, questionId: string, questionNumber: number) {
    await this.track('question_viewed', userId, {
      questionId,
      questionNumber
    });
  }
}
