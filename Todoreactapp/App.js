import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Load tasks from AsyncStorage on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    saveTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
      };

      // Add task animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    // Delete animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTasks(tasks.filter((item) => item.id !== taskId));
      fadeAnim.setValue(1);
    });
  };

  const toggleComplete = (taskId) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setEditText(task.text);
    setModalVisible(true);
  };

  const updateTask = () => {
    if (editText.trim()) {
      setTasks(
        tasks.map((item) =>
          item.id === editingTask.id
            ? { ...item, text: editText }
            : item
        )
      );
      setModalVisible(false);
      setEditingTask(null);
      setEditText('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <Animated.View style={[styles.taskContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity 
                style={styles.taskTextContainer}
                onPress={() => startEditing(item)}
              >
                <Text style={[
                  styles.taskText,
                  item.completed && styles.completedTask
                ]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
              <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                  <Text style={styles.completeButton}>
                    {item.completed ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
        />
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={updateTask}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButton: {
    marginRight: 10,
    fontSize: 18,
    color: '#5C5CFF',
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 10,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#5C5CFF',
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
  }
});



