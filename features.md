# ChurchFlow - Ministry Management Platform

## Overview

ChurchFlow is a modern church management application designed to streamline ministry operations. The platform provides scheduling, song library management, team coordination, and availability tracking. Built as a full-stack web application, it serves churches and religious organizations looking to modernize their administrative processes.

The application handles event creation and management, worship song libraries with YouTube integration, team member availability tracking through blockouts, and role-based access control for administrators and regular users

### Future Improvements

**Org structure**: Allow orgs to create teams, be able to add team to people to their orgs. Team members can have different roles (Admin, Standard Members with team role i.e. Vocalist, Bass Player, Piano)

**Admin Users**: Admins should be able to view the org structure, add new members, remove members

**Org and Team Management (new)**:
  - Create organizations ✅
  - Create teams within an organization ✅
  - Add team members to the teams ✅
  - Assign roles: Admin or User ✅
  - Assign member functions for Users: Vocalist, Bass Player, Piano, Guitar, or Other ✅

**Calendar Invites**: 
  - Once an event is created and everyone accepts, it should send a calendar invite to everyone's device
  - When team members accept the calendar invite, it should alert the admin and display the team members availability for a particular event

**Team Chat**: allow team members to chat

**AI Features**: 
  - Service reviews
  - Performance reviews
  - Event analysis
  - Yearly and quarterly reviews and performance indicators


**Known Issues**
- calendar blockout is not showing up in light mode. and the events legend for the dark mode is not visible
- pairing kinde auth user with db user: when user is created in kinde, user should be added to db
