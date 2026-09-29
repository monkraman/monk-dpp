import { Component, OnInit } from '@angular/core';

interface PassportRow {
  id: string;
  type: string;
  from: string;
  to: string;
  status: 'Draft' | 'Published';
  date: string;
}

interface ActivityItem {
  actor: string;
  timestamp: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  materialTopFilter = 'Top 15';
  supplierTopFilter = 'Top 15';

  materials = [
    { name: 'Iron Ore', color: '#DCEBFA' },
    { name: 'DETTOL PKGBOX', color: '#6BA6E8' },
    { name: 'Polyethylene-Terepht...', color: '#3A82D6' },
    { name: 'Chloroxylenol PCMX', color: '#1B5EB8' },
    { name: 'Lyocell', color: '#003B73' },
  ];

  suppliers = [
    { name: 'Bharat Ore Mines Pvt...', color: '#DCEBFA' },
    { name: 'Norvantia Packaging ...', color: '#88BCF5' },
    { name: 'Monk Spaces', color: '#3A82D6' },
    { name: 'Fenbrolt Specialty C...', color: '#1B5EB8' },
    { name: 'Cascarine Polymers P...', color: '#003B73' },
  ];

  passports: PassportRow[] = [
    {
      id: '2842DBE9',
      type: 'Product Passport',
      from: 'Monk Spaces',
      to: 'Meridian Label & Print Co',
      status: 'Draft',
      date: '4 days ago',
    },
    {
      id: '771B267A',
      type: 'Product Passport',
      from: 'Monk Spaces',
      to: 'Suraksha Scrap Traders',
      status: 'Draft',
      date: 'Sep 15, 2026, 2:13...',
    },
    {
      id: 'D8696627',
      type: 'Product Passport',
      from: 'Fenbrolt Specialty Chemicals',
      to: 'Reckitt Benckiser Private Limited',
      status: 'Published',
      date: 'Sep 14, 2026, 3:29...',
    },
    {
      id: '5255A0B9',
      type: 'Product Passport',
      from: 'Cascarine Polymers Pvt. Ltd.',
      to: 'Quixmere Containers Co.',
      status: 'Published',
      date: 'Sep 14, 2026, 1:56...',
    },
    {
      id: '971F2793',
      type: 'Product Passport',
      from: 'Monk Spaces',
      to: 'Cascarine Polymers Pvt. Ltd.',
      status: 'Published',
      date: 'Sep 14, 2026, 1:52...',
    },
    {
      id: '2DBC945A',
      type: 'Product Passport',
      from: 'Monk steel spaces and co',
      to: 'MS Construction',
      status: 'Published',
      date: 'Sep 14, 2026, 1:10...',
    },
  ];

  activities: ActivityItem[] = [
    {
      actor: 'Monk Spaces',
      timestamp: 'Sep 14, 2026, 1:52 PM',
      description: 'Sent Product Passport to Cascarine Polymers Pvt. Ltd.',
    },
    {
      actor: 'Monk Spaces',
      timestamp: 'Sep 14, 2026, 1:01 PM',
      description: 'Sent Product Passport to MS Construction',
    },
    {
      actor: 'Monk Spaces',
      timestamp: 'Sep 14, 2026, 1:00 PM',
      description: 'Sent Product Passport to Monk steel spaces and co',
    },
    {
      actor: 'Monk Spaces',
      timestamp: 'Sep 14, 2026, 11:34 AM',
      description: 'Sent Product Passport to Cascarine Polymers Pvt. Ltd.',
    },
    {
      actor: 'Monk Spaces',
      timestamp: 'Sep 10, 2026, 9:10 PM',
      description: 'Sent Product Passport to Reckitt Benckiser Private Limited',
    },
  ];

  ngOnInit(): void {}
}
