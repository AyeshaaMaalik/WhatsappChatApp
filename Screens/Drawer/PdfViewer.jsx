import React from 'react';
import { View, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

const PdfViewer = ({ route }) => {
  const { filePath } = route.params; 

  return (
    <View style={{ flex: 1 }}>
      <Pdf
        source={{ uri: filePath, cache: true }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`current page: ${page}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        onPressLink={(uri) => {
          console.log(`Link pressed: ${uri}`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PdfViewer;
